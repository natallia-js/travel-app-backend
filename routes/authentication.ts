import { Router } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { validationResult, check } from 'express-validator';
import * as config from 'config';
import * as multer from 'multer';
import * as uuid from 'uuid';
import User from '../models/User';
import { IUser } from '../models/interfaces';
import { CONFIG_JWT_SECRET_PARAM_NAME, UPLOADED_FILES_RELATIVE_PATH, UPLOADED_FILES_PATH } from '../constants';

const router = Router();

/**
 * Определяем каталог хранения загружаемых файлов и правило формирования их имен в данном каталоге.
 */
const storage = multer.diskStorage({
  destination: function (_req_, _file_, cb) {
    cb(null, UPLOADED_FILES_PATH);
  },
  filename: function (_req_, file, cb) {
    const tmpArr = file.originalname.split('.');
    const fileExt = tmpArr.pop();
    const fileName = uuid.v4() + '.' + fileExt;
    cb(null, fileName);
  }
});

/**
 * Типы принимаемых файлов.
 */
const fileFilter = (_req_, file, cb) => {
  if (file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"||
      file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

// Для загрузки фото пользователей
const upload = multer({ storage: storage, fileFilter: fileFilter });

/**
 * Обработка запроса на регистрацию нового пользователя
 * Параметры тела запроса:
 * login - логин пользователя (обязателен),
 * password - пароль пользователя (обязателен),
 * name - имя пользователя (обязательно),
 */
router.post(
  '/register',
  upload.fields([
    { name: 'filedata', maxCount: 1 }
  ]),
  [
    check('login')
      .isLength({ min: 1 })
      .withMessage('Minimal login length is 1 symbol')
      .bail() // stops running validations if any of the previous ones have failed
      .matches(/^[A-Za-z0-9_]+$/)
      .withMessage('Only latin letters, numbers and _ sign can be present in login'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Minimal password length is 6 symbols')
      .bail()
      .matches(/^[A-Za-z0-9_]+$/)
      .withMessage('Only latin letters, numbers and "_" sign can be present in password'),
    check('name')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Minimal name length is 1 symbol')
  ],
  async (req, res) => {

    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Wrong registration data'
        })
      }

      const { login, password, name } = req.body;

      const candidate: IUser = await User.findOne({ login });

      if (candidate) {
        return res.status(400).json({ message: 'User with this login already exists' });
      }

      let filedata: any = req.files['filedata'][0];
      const photoUrl = filedata ? UPLOADED_FILES_RELATIVE_PATH + filedata.filename : '';

      const hashedPassword: any = await bcrypt.hash(password, 12);

      const user: IUser = new User({ login, password: hashedPassword, name, photoUrl });

      await user.save();

      res.status(201).json({ message: 'User successfully registered',
                             hashedPassword,
                             userId: user._id });

    } catch (e) {
      res.status(500).json({ message: 'Something went wrong, try again' });
    }
  }
);

/**
 * Обработка запроса на вход в систему.
 * Параметры тела запроса:
 * login - логин пользователя (обязателен),
 * password - пароль пользователя (обязателен),
 */
router.post(
  '/login',
  [
    check('login', 'Enter login').exists(),
    check('password', 'Enter password').exists()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Wrong authentication data'
        })
      }

      const { login, password } = req.body;

      const user: IUser = await User.findOne({ login });

      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }

      const isMatch: any = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Wrong password, try again' });
      }

      // Создаем JWT-токен (as string) для успешно вошедшего в систему пользователя.
      // JWT состоит из трех частей: заголовок (header - JSON-объект, содержит информацию о том,
      // как должна вычисляться JWT подпись), полезные данные (payload) и
      // подпись (signature - получается так: алгоритм base64url кодирует header и payload, соединяет
      // закодированные строки через точку, затем полученная строка хешируется алгоритмом, заданном в
      // header на основе секретного ключа).
      // Здесь производится synchronous sign with default (HMAC SHA256).

      const token = jwt.sign(
        {
          userId: user._id,
        },
        config.get(CONFIG_JWT_SECRET_PARAM_NAME)
      );

      res.status(201).json({ token,
                             userId: user._id,
                             name: user.name
                          });

    } catch (e) {
      res.status(500).json({ message: 'Something went wrong, try again' });
    }
  }
);

export default router;
