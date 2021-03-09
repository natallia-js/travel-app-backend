import { Router } from 'express';
import Country, { ICountry } from '../models/Country';
import { DEF_COUNTRIES_NUM_TO_RETURN, DEF_LANG } from '../constants';

const router = Router();

/**
 * Allows to get a list of short info about countries.
 * Request params:
 *   countriesNum - the number of countries to return (if not set, DEF_COUNTRIES_NUM_TO_RETURN will be returned)
 *   reloadLang - the language ('en','ru','de'; DEF_LANG is default)
 */
router.post('/countries',
           async (req, res) => {
  try {
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
router.post('/countryDetailed',
           async (req, res) => {
  try {
    let { countryID, reloadLang } = req.body;

    if (!countryID) {
      res.status(404).json({ message: 'Country id required' });
      return;
    }
    if (!reloadLang) {
      reloadLang = DEF_LANG;
    }

    let data: ICountry = await Country.findOne({ _id: countryID, 'name.lang': reloadLang });

    if (data) {
      res.status(201).json({
        id: data._id,
        name: data.name.find(el => el.lang === reloadLang).value,
        capital: data.capital.find(el => el.lang === reloadLang).value,
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

export default router;
