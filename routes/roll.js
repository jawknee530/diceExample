var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  //create the expression object
  var expr = {
    rolls: [],
    arith: '',
    result: 0,
    str: ''
  }

  expr.str = req.query.roll;
  message = solveExpr(expr);
  res.send(message);
});

var solveExpr = function(expr) {
  var strs = [];
  if(!initCheckInput(expr.str)) {
    return 'Not a valid input, unrecognized character';
  }
  expr.str = expr.str.replace(/ /g, '');
  console.log(expr.str);
  if(expr.str.includes('+')) {
    expr.arith = '+';
    strs = expr.str.split('+');
  } else if (expr.str.includes('-')) {
    expr.arith = '-';
    strs = expr.str.split('-');
  } else {
    strs[0] = expr.str;
  }
  buildRolls(expr, strs);
  getFinalResult(expr);
  return expr.result.toString();
}

var getFinalResult = function(expr) {
  if(expr.arith === '+') {
    expr.result = expr.rolls[0].result + expr.rolls[1].result;
  } else if(expr.arith === '-') {
    expr.result = expr.rolls[0].result - expr.rolls[1].result;
  } else {
    expr.result = expr.rolls[0].result;
  }
}
var buildRolls = function(expr, strs) {
  console.log('building rolls');
  for(var i = 0; i < strs.length; i++) {
    expr.rolls[i] = {
        lowest: 0,
        highest: 0,
        explosive: 0,
        multiple: 0,
        literal: false,
        indivRolls: [],
        result: 0,
        str: strs[i]
    };
    expr.rolls[i].result = startRolls(expr.rolls[i]);
  }
  console.log(expr);
}


var startRolls = function(roll) {
  if(!setCons(roll)) {
    return 'Not a valid input, conditional failure'
  } else {
    completeRolls(roll);
    computeResult(roll);
    return roll.result;
  }
}

var compareNumbers = function(a, b) {
  return a-b;
}
var computeResult = function(roll) {
  var rollsLen = roll.indivRolls.length
  console.log('got length')
  if(roll.literal) {
    roll.result = roll.indivRolls[0];
    return;
  } else if(roll.lowest){
    roll.indivRolls.sort(compareNumbers)
    roll.indivRolls = roll.indivRolls.slice(roll.lowest, rollsLen)
  } else if(roll.highest) {
    roll.indivRolls.sort(compareNumbers)
    roll.indivRolls = roll.indivRolls.slice(rollsLen-roll.highest, rollsLen)
  } else if(roll.explosive) {
  } 

  for(var i in roll.indivRolls) {
    roll.result += roll.indivRolls[i];
  }
}

var completeRolls = function(roll) {
  if(roll.literal) { 
    roll.indivRolls.push(parseInt(roll.str));
    return;
  } else if(roll.explosive) {
    console.log('explosive rolls');
    explosiveRolls(roll);
    return;
  }
  if(roll.str.charAt(0) === 'd') {
    str = []
    str[0] = 1;
    str[1] = roll.str.slice(1, roll.str.length);
  } else {
    var str = roll.str.split('d');
  }
  for(var i = 0; i < parseInt(str[0]); i++) {
    roll.indivRolls.push(Math.floor(Math.random() * str[1])+1);
  }
}

var explosiveRolls = function(roll) {
  var str = roll.str.split('d');
  var toComplete = parseInt(str[0]);
  for(var i = 0; i < toComplete; i++) {
    curRoll = Math.floor(Math.random() * str[1]) + 1;
    roll.indivRolls.push(curRoll);
    if(curRoll >= parseInt(roll.explosive)) { 
      console.log('roll was higher');
      i--;
    }
  }
}

var initCheckInput = function(str) {
  var reject = /[^0-9dxk' '+-]/;
  if(reject.test(str)) { return false; }
  return true;
}

var setCons = function(roll) {
  if(!(/[a-zA-Z]/.test(roll.str))) {roll.literal = true;}
  if(roll.str.includes('x')) {
    var tmp = roll.str.split('x');
    roll.explosive = tmp[1];
    roll.str = tmp[0];
    var test = tmp[0].split('d');
    return checkSize(test[1], tmp[1]);
  }
  if(roll.str.includes('k')) {
    var tmp = roll.str.split('k');
    roll.highest = tmp[1];
    roll.str = tmp[0];
    var test = tmp[0].split('d');
    return checkSize(test[0], tmp[1]);
  }
  if(roll.str.split('d').length === 3) {
    var tmp = roll.str.split('d');
    var tmp2 = tmp[0].concat('d' + tmp[1]);
    roll.lowest = tmp[2];
    roll.str = tmp2;
    return checkSize(tmp[0], tmp[2]);
  }
  return true;
}

var checkSize = function(a, b) {
  var n = parseInt(a);
  var x = parseInt(b);
  if((n > x) && (x > 0)) {
    console.log('true');
    return true;
  } else {
    console.log('false');
    return false;
  }
}

module.exports = router;
