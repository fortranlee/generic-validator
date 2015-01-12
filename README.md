# generic-validator
A generic JavaScript Form Validator

# usage

`js`
  var validator = require('generic-validator')();
  
  validator.addValidation('name', '用户名', {required: true});
  validator.addValidation('pass', '密码', {required: true, min_length: 6, max_length: 12, isNormalWord: true});
  validator.addValidation('email', '邮箱地址', {required: false, isEmail: true});
  
  validator.runValidation({'name': 'fortran', 'pass': '_234322343', email: 'lihuiquan@email.szu.edu.cn'});
  
  console.log(validator.valid, validator.errors, validator.results);
