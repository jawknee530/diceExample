var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  /*create the expression object 
    rolls: stores left and right rolls
    arith: stores the arithmetic operator to be used +/-
    result: final result
    str: string passed in from client*/
  var expr = {
    rolls: [],
    arith: '',
    result: 0,
    str: ''
  }

  expr.str = req.query.roll;
  message = solveExpr(expr);
  if(message === 'NaN') {
    message = 'Input formatted incorrectly';
  }
  res.send(message);
});

/*Initial functino to start the process of solving
  the expression.*/
var solveExpr = function(expr) {
  //Array to hold two halves of the expression in case of +/-
  var strs = [];
  //initial basic check of the expression
  if(!initCheckInput(expr.str)) {
    return 'Not a valid input, please re-read instructions';
  }
  //strip spaces, save arith, split expression if needed
  expr.str = expr.str.replace(/ /g, '');
  if(expr.str.includes('+')) {
    expr.arith = '+';
    strs = expr.str.split('+');
  } else if (expr.str.includes('-')) {
    expr.arith = '-';
    strs = expr.str.split('-');
  } else {
    strs[0] = expr.str;
  }
  //creates roll objects and completes them
  buildRolls(expr, strs);
  //grabs either both or the only rolls results
  getFinalResult(expr);
  return expr.result.toString();
}

/*Creates the one or two roll objects then starts the process
  of solving each one*/
var buildRolls = function(expr, strs) {
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
}

/*Computes final result from one or two rolls*/
var getFinalResult = function(expr) {
  if(expr.arith === '+') {
    expr.result = expr.rolls[0].result + expr.rolls[1].result;
  } else if(expr.arith === '-') {
    expr.result = expr.rolls[0].result - expr.rolls[1].result;
  } else {
    expr.result = expr.rolls[0].result;
  }
}

/*Sets the conditions in the roll object,
  comppletes the rolls and finally computes the result*/
var startRolls = function(roll) {
  if(!setCons(roll)) {
    return 'Not a valid input, one or more roll formatted incorrectly'
  } else {
    completeRolls(roll);
    computeResult(roll);
    return roll.result;
  }
}

/*Completes all of the 'indivRolls' for each 'roll'*/
var completeRolls = function(roll) {
  if(roll.literal) { //literal only requires pushing an int onto array
    roll.indivRolls.push(parseInt(roll.str));
    return;
  } else if(roll.explosive) { //Explosive requires a seperte function
    explosiveRolls(roll);
    return;
  }
  if(roll.str.charAt(0) === 'd') { //One die roll the first char is a 'd'
    str = []
    str[0] = 1;
    str[1] = roll.str.slice(1, roll.str.length);
  } else { //all other roll types
    //spliting on d to get the indivRolls amount and the sides
    var str = roll.str.split('d');
  }
  //for loop pushes indivRolls onto the array
  for(var i = 0; i < parseInt(str[0]); i++) {
    roll.indivRolls.push(Math.floor(Math.random() * parseInt(str[1]))+1);
  }
}

/*Used for explosive rolls*/
var explosiveRolls = function(roll) {
  //spliting on d to get the indivRolls amount and the sides
  var str = roll.str.split('d');
  var toComplete = parseInt(str[0]);
  for(var i = 0; i < toComplete; i++) {
    curRoll = Math.floor(Math.random() * str[1]) + 1;
    roll.indivRolls.push(curRoll);
    //decrements i if the current roll is larger or equal to the explosive
    //trigger. Can possibly run infinitely
    if(curRoll >= parseInt(roll.explosive)) { 
      console.log('roll was higher');
      i--;
    }
  }
}

/*Used as function for .sort() to sort by int values*/
var compareNumbers = function(a, b) {
  return a-b;
}
/*Uses condition flags to figure out how to add up all of the indivRolls
  Uses .sort() and .slice() to keep the lowest or highest as required*/
var computeResult = function(roll) {
  var rollsLen = roll.indivRolls.length

  if(roll.literal) {
    roll.result = roll.indivRolls[0];
    return;
  } else if(roll.lowest){
    roll.indivRolls.sort(compareNumbers)
    roll.indivRolls = roll.indivRolls.slice(roll.lowest, rollsLen)
  } else if(roll.highest) {
    roll.indivRolls.sort(compareNumbers)
    roll.indivRolls = roll.indivRolls.slice(rollsLen-roll.highest, rollsLen)
  }

  for(var i in roll.indivRolls) {
    roll.result += roll.indivRolls[i];
  }
}

/*Basic input check to veryify only accepted characters were input*/
var initCheckInput = function(str) {
  var reject = /[^0-9dxk' '+-]/;
  if(reject.test(str)) { return false; }
  if(str.includes('+')) { 
    multiAriths = str.split('+');
  } else if(str.includes('-')) { 
    multiAriths = str.split('-'); 
  } else { 
    multAriths = []; 
  }
  console.log(multAriths.length);
  if(multAriths.length > 2) { return false; }
  return true;
}

/*Checks each roll and sets condition flags that are used 
  during the rolling and solving process*/
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

/*checks to make sure D, K or E are within range
  with reference to N*/
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
