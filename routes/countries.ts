import { Router } from 'express';
import { validationResult, check, body } from 'express-validator';
import Country from '../models/Country';
import { ICountry, IUserRating } from '../models/interfaces';
import { DEF_COUNTRIES_NUM_TO_RETURN, DEF_LANG } from '../constants';
import auth from '../middleware/auth.middleware';

const router = Router();

/**
 * Allows to get a list of short info about countries.
 * Request params:
 *   countriesNum - the number of countries to return (if not set, DEF_COUNTRIES_NUM_TO_RETURN will be returned)
 *   reloadLang - the language ('en','ru','de'; DEF_LANG is default)
 */
router.post(
  '/countries',
  [
    check('countriesNum')
      .if(body('countriesNum').exists())
      .trim()
      .isInt()
      .withMessage('countriesNum param must be an integer'),
    check('reloadLang')
      .if(body('reloadLang').exists())
      .trim()
      .isIn(['en','ru','de'])
      .withMessage('reloadLang must be one of [en, ru, de]')
  ],
  async (req, res) => {

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Incorrect data in countries request'
      });
    }

    let { countriesNum, reloadLang } = req.body;

    if (!countriesNum) {
      countriesNum = DEF_COUNTRIES_NUM_TO_RETURN;
    }
    if (!reloadLang) {
      reloadLang = DEF_LANG;
    }

    const data: Array<ICountry> = await Country.find({ 'name.lang': reloadLang }).limit(Number(countriesNum));

    if (data && data.length) {
      res.status(201).json(data.map(record => {
        return {
          id: record._id,
          name: record.name.find(el => el.lang === reloadLang).value,
          capital: record.capital.find(el => el.lang === reloadLang).value,
          currency: record.currency,
          timezone: record.timezone,
          photoUrl: record.photoUrl,
        };
      }));

    } else {
      res.status(201).json([]);
    }

  } catch (e) {
    res.status(500).json({ message: 'Something went wrong, try again' });
  }
});

/**
 * Allows to get a list of short info about countries.
  * Request params:
 *   countryID - the unique id of the country to find detailed information
 *   reloadLang - the language ('en','ru','de'; DEF_LANG is default)
 */
router.post(
  '/countryDetailed',
  [
    check('countryID')
      .exists()
      .withMessage('countryID param must be set'),
    check('reloadLang')
      .if(body('reloadLang').exists())
      .trim()
      .isIn(['en','ru','de'])
      .withMessage('reloadLang must be one of [en, ru, de]')
  ],
  async (req, res) => {

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Incorrect data in countryDetailed request'
      });
    }

    let { countryID, reloadLang } = req.body;

    if (!reloadLang) {
      reloadLang = DEF_LANG;
    }

    let data: ICountry = await Country.findOne({ _id: countryID, 'name.lang': reloadLang });

    if (data) {
      res.status(201).json({
        id: data._id,
        name: data.name.find(el => el.lang === reloadLang).value,
        capital: data.capital.find(el => el.lang === reloadLang).value,
        currency: data.currency,
        timezone: data.timezone,
        photoUrl: data.photoUrl,
        description: data.description.find(el => el.lang === reloadLang).value,
        videoUrl: data.videoUrl,
        sights: data.sights.map(record => {
          return {
            id: record._id,
            name: record.name.find(el => el.lang === reloadLang).value,
            description: record.description.find(el => el.lang === reloadLang).value,
            photoUrl: record.photoUrl,
            userRating: record.userRating,
          };
        }),
      });

    } else {
      res.status(201).json({});
    }

  } catch (e) {
    res.status(500).json({ message: 'Something went wrong, try again' });
  }
});

/**
 * Allows to set user's rating for the given sight.
  * Request params:
 *   countryID - the unique id of the country of the sight
 *   sightID - the unique id of the sight
 *   userID - the unique id of the user
 *   rating - number 1...5
 */
router.post(
  '/setRating',
  auth,
  [
    check('countryID')
      .exists()
      .withMessage('countryID param must be set'),
    check('sightID')
      .exists()
      .withMessage('sightID param must be set'),
    check('userID')
      .exists()
      .withMessage('userID param must be set'),
    check('rating')
      .trim()
      .isInt({ min: 1, max: 5 })
      .withMessage('rating must be an integer value 1..5')
  ],
  async (req, res) => {

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Incorrect data in countryDetailed request'
      });
    }

    const { countryID, sightID, userID, rating } = req.body;

    let data: ICountry = await Country.findOne({ _id: countryID });

    if (!data) {
      return res.status(400).json({ message: 'Country with the given id was not found' });
    }

    let foundSight = false;

    for (let sight of data.sights) {

      if (String(sight._id) === sightID) {

        foundSight = true;

        let prevUserRatingIndex = -1;

        for (let i = 0; i < sight.userRating.length; i += 1) {
          const userRating = sight.userRating[i];

          if (String(userRating.userId) === userID) {
            prevUserRatingIndex = i;
            break;
          }
        }

        if (prevUserRatingIndex >= 0) {
          if (sight.userRating[prevUserRatingIndex].rating !== rating) {
            sight.userRating[prevUserRatingIndex].rating = rating;
            data.save();
          }
        } else {
          const setRating: IUserRating = { userId: userID, rating };
          sight.userRating.push(setRating);
          data.save();
        }

        break;
      }
    }

    if (!foundSight) {
      return res.status(400).json({ message: 'Sight with the given id was not found' });
    }

    res.status(201).json({
      id: data._id,
      sights: data.sights.map(record => {
        return {
          id: record._id,
          userRating: record.userRating,
        };
      }),
    });

  } catch (e) {
    res.status(500).json({ message: 'Something went wrong, try again' });
  }
});

/**
 * Allows to get timezone for the country capital.
 * Request params:
 *   countryID - the unique id of the country
 */
router.post(
  '/timezone',
  [
    check('countryID')
      .exists()
      .withMessage('countryID param must be set'),
  ],
  async (req, res) => {

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Incorrect data in timezone request'
      });
    }

    let { countryID } = req.body;

    const data: ICountry = await Country.findOne({ _id: countryID });

    if (!data) {
      return res.status(400).json({ message: 'Country with the given id was not found' });
    }

    res.status(201).json({ timezone: data.timezone });

  } catch (e) {
    res.status(500).json({ message: 'Something went wrong, try again' });
  }
});

/**
 * Allows to get currency of the capital.
 * Request params:
 *   countryID - the unique id of the country
 */
router.post(
  '/currency',
  [
    check('countryID')
      .exists()
      .withMessage('countryID param must be set'),
  ],
  async (req, res) => {

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Incorrect data in currency request'
      });
    }

    let { countryID } = req.body;

    const data: ICountry = await Country.findOne({ _id: countryID });

    if (!data) {
      return res.status(400).json({ message: 'Country with the given id was not found' });
    }

    res.status(201).json({ currency: data.currency });

  } catch (e) {
    res.status(500).json({ message: 'Something went wrong, try again' });
  }
});

export default router;
