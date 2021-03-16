/*jshint esversion: 6 */
class multiple_choice {
  constructor(right = [], wrong = [], unknown = []){
    this.correctAnswers = right;
    this.unknownAnswers = unknown;
    this.incorrectAnswers = wrong;
  }
  
  static answer(text, answers = []){
    if(!savedText.includes(text)){
      multiple_choice.addQuestion(text, [], [], answers);
    }
    
    var question = savedAnswers[savedText.indexOf(text)];

    if(answers.length == 0){
      answers = answers.concat(question.correctAnswers).concat(question.unknownAnswers).concat(question.incorrectAnswers);
    }

    var right = [];

    var wrong = [];

    var unknown = [];

    for(var i = 0; i < answers.length; i++){
      if(question.correctAnswers.includes(answers[i])){
      right.push(answers[i]);
      } else if(question.incorrectAnswers.includes(answers[i])) {
        wrong.push(answers[i]);
      } else {
        unknown.push(answers[i]);
      }
    }

    return {correct: right, wrong: wrong, unknown: unknown};
  }

  static addQuestion(text, answers = [], wrong = [], unknown = []){
    savedText.push(text);
    var obj = new multiple_choice(answers, wrong, unknown);
    savedAnswers.push(obj);
  }

  static modifyAnswers(question, newRight = [], newWrong = [], newUnknown = []) {
    for(var i = 0; i < newUnknown.length; i++) {
      if((!question.correctAnswers.includes(newUnknown[i]))&&(!question.incorrectAnswers.includes(newUnknown[i]))&&(!question.unknownAnswers.includes(newUnknown[i]))){
        question.unknownAnswers.push(newUnknown[i]);
      }
    }
    for(var i=0; i < newRight.length;i++){
      if(question.unknownAnswers.includes(newRight[i])){
        question.unknownAnswers.splice(question.unknownAnswers.indexOf(newRight[i]), 1);
      }
      if(!question.correctAnswers.includes(newRight[i])) {
        question.correctAnswers.push(newRight[i]);
      }
    }
    for(var i=0; i < newWrong.length; i++) {
      if(question.unknownAnswers.includes(newWrong[i])){
        question.unknownAnswers.splice(question.unknownAnswers.indexOf(newWrong[i]), 1);
      }
      if(!question.incorrectAnswers.includes(newWrong[i])) {
        question.incorrectAnswers.push(newWrong[i]);
      }
    }
  }

  static setUp() {
    for(var i = 1; i < document.getElementsByClassName("notranslate lang-en").length; i++) {
      document.getElementsByClassName("notranslate lang-en")[i].parentElement.parentElement.addEventListener("click", (e)=> {
        CURRENTANSWER = e.srcElement.textContent;
        questionObserver();
      });
    }
  }

  static displayAnswers(results) {
    for(var i = 1; i < document.getElementsByClassName("notranslate lang-en").length; i++) {
      var el = document.getElementsByClassName("notranslate lang-en")[i];
      if(results.correct.includes(el.textContent)){
        el.parentElement.parentElement.style.backgroundColor = "#00FF00";
      } else if(results.wrong.includes(el.textContent)) {
        el.parentElement.parentElement.style.backgroundColor = "#FF0000";
      } else {
        el.parentElement.parentElement.style.backgroundColor = "#777777";
      }
    }
  }

}

class text_responce {
  constructor(right = ""){
    this.answer = right;
  }

  static answer(text){
    if(!savedText.includes(text)){
      text_responce.addQuestion(text);
    }
    var question = savedAnswers[savedText.indexOf(text)];
    return question.answer;
  }

  static addQuestion(text, answer = ""){
    savedText.push(text);
    var obj = new text_responce(answer);
    savedAnswers.push(obj);
  }

  static modifyAnswers(question, right){
    question.answer = right;
  }

  static setUp() {
    document.getElementsByClassName("sc-gBGeja eYKMSX")[0].addEventListener("click", () => {CURRENTQUESTION = document.getElementsByClassName("sc-bEGMXy lnqrzS")[0].value;});
  }

}

function get_question() {

  var question = document.getElementsByClassName("sc-bKcCCv lfxIUK")[0].children[0].children[0].textContent;

  var question_type = "";
  var answers = [];

  if(document.getElementsByClassName("notranslate lang-en").length > 1){
    question_type = "multiple_choice";
    for(var i = 1; i < document.getElementsByClassName("notranslate lang-en").length; i++){
      answers.push(document.getElementsByClassName("notranslate lang-en")[i].textContent);
    }
  } else {
    question_type = "text_responce";
  }

  var values = {
    text: question,
    type: question_type,
    answer_options: answers
  };
  return values;
}

function update(){
  var question = CURRENTQUESTION;
  var selected_answer = CURRENTANSWER;
  var result = RESULT;

  if(question.type == "multiple_choice"){
    if(result){
      multiple_choice.modifyAnswers(savedAnswers[savedText.indexOf(question.text)], [selected_answer],[],[]);
    } else {
      multiple_choice.modifyAnswers(savedAnswers[savedText.indexOf(question.text)], [],[selected_answer],[]);
    }

    multiple_choice.modifyAnswers(savedAnswers[savedText.indexOf(question.text)], [], [], question.answer_options.splice(question.answer_options.indexOf(selected_answer), 1));

  } else {
    console.log("oops");
  }

}

function questionObserver() {
  var observer = new MutationObserver(() => {
    observer.disconnect();
    observer = new MutationObserver(() => {
      RESULT = wasAnswerRight();

      update();

      observer.disconnect();
    });
    observer.observe(document.getElementsByClassName("sc-HWglP dnSgUS")[0].children[0], {attributes:true, childList:true});
  });
  observer.observe(document.getElementsByClassName("sc-HWglP dnSgUS")[0].children[0], {attributes:true, childList:true, subtree:true});
}

function wasAnswerRight() {
  var value = document.getElementsByClassName("sc-bKcCCv lfxIUK")[0].children[0].children[0].textContent;
  value = parseInt(value.replace("$",""));
  if(value > 0){
    return true;
  } else {
    return false;
  }

}

var savedText = [];
var savedAnswers = [];

var CURRENTQUESTION = null;
var CURRENTANSWER = null;
var RESULT = null;

function start() {
  document.addEventListener("keydown", (e)=>{
    if(e.keyCode == 9) {
      CURRENTQUESTION = get_question();
      multiple_choice.setUp();
      var eval = multiple_choice.answer(CURRENTQUESTION.text, CURRENTQUESTION.answer_options);
      multiple_choice.displayAnswers(eval);
    }
  });
}

start();
