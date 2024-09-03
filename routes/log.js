const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

const {
  getAllLogs,
  getAllMyPosts,
  getAllPostsOfUser,
  getPostsByCounty,
  getPostsByDay,
  getSingleLog,
  createLogMobile,
} = require('../controllers/log');

const { createLog } = require('../controllers/logs/createLog');

// GET See all logs from everyone
router.get('/all/everyone', getAllLogs);

// GET See all logs from logged in User
router.get('/all/my-posts', auth, getAllMyPosts);

// GET See all logs from one user
router.get('/all/:id', getAllPostsOfUser);

//GET See all posts from one area
router.get('/region/:county', getPostsByCounty);

//GET See all posts from a certain date
router.get('/date/:year/:day', getPostsByDay);

// GET see individual log
//Come back to this later and make this have some properties if the user clicks their own post
router.get('/view/:logId', getSingleLog);

//POST Create a Log

router.post('/create', auth, createLog);

router.post('/create-mobile', createLogMobile);

module.exports = router;
