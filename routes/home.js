const router = require('express').Router();
router.get('/',(req,res)=>{
    return res.status(200).render('home');
  })

module.exports = router;