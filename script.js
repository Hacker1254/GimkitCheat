/*jshint esversion: 6 */
class multiple_choice {


  constructor(right = [], wrong = [], unknown = []){
    this.correctAnswers = right;
    this.unknownAnswers = unknown;
    this.incorrectAnswers = wrong;
  }

  static answer(text, answers = []){
    if(!MC.savedText.includes(text)){
      multiple_choice.addQuestion(text, [], [], answers);
    }
    
    var question = MC.savedAnswers[MC.savedText.indexOf(text)];

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
    MC.savedText.push(text);
    var obj = new multiple_choice(answers, wrong, unknown);
    MC.savedAnswers.push(obj);
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

class text_response {
  constructor(right = ""){
    this.answer = right;
  }

  static answer(text){
    if(!TR.savedText.includes(text)){
      text_response.addQuestion(text);
    }
    var question = TR.savedAnswers[TR.savedText.indexOf(text)];
    return question.answer;
  }

  static addQuestion(text, answer = ""){
    TR.savedText.push(text);
    var obj = new text_response(answer);
    TR.savedAnswers.push(obj);
  }

  static modifyAnswers(question, right){
    question.answer = right;
  }

  static setUp() {
    document.forms[0].children[0].addEventListener('change', (e) => {CURRENTANSWER = e.srcElement.value;});
    questionObserver();
  }

  static displayAnswers(value) {
    document.getElementById("content").children[0].children[0].children[0].children[1].children[0].children[0].children[1].children[0].children[1].textContent = value;
    if(value == "") {
      document.getElementById("content").children[0].children[0].children[0].children[1].children[0].children[0].children[1].children[0].children[1].style.backgroundColor = "#777777";
    } else {
      document.getElementById("content").children[0].children[0].children[0].children[1].children[0].children[0].children[1].children[0].children[1].style.backgroundColor = "#00aa00";
      var OVERWRITE = true;
      if (OVERWRITE) {
        var el = document.createElement('textarea');
        el.value = value;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
    }
  }

}

function get_question() {

  var question = document.getElementById("content").children[0].children[0].children[0].children[1].children[0].children[0].children[0].children[0].children[0].children[0].children[0].textContent;

  var question_type = "";
  var answers = [];

  if(document.getElementsByClassName("notranslate lang-en").length > 1){
    question_type = "multiple_choice";
    for(var i = 1; i < document.getElementsByClassName("notranslate lang-en").length; i++){
      answers.push(document.getElementsByClassName("notranslate lang-en")[i].textContent);
    }
  } else {
    question_type = "text_response";
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
      multiple_choice.modifyAnswers(MC.savedAnswers[MC.savedText.indexOf(question.text)], [selected_answer],[],[]);
    } else {
      multiple_choice.modifyAnswers(MC.savedAnswers[MC.savedText.indexOf(question.text)], [],[selected_answer],[]);
    }

    multiple_choice.modifyAnswers(MC.savedAnswers[MC.savedText.indexOf(question.text)], [], [], question.answer_options.splice(question.answer_options.indexOf(selected_answer), 1));

  } else {
    if(result) {
      text_response.modifyAnswers(TR.savedAnswers[TR.savedText.indexOf(question.text)], selected_answer);
    }
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
    observer.observe(document.getElementById("content").children[0].children[0].children[0].children[1].children[0], {attributes:true, childList:true});
  });
  observer.observe(document.getElementById("content").children[0].children[0].children[0].children[1].children[0], {attributes:true, childList:true});
}

function wasAnswerRight() {
  var value = document.getElementById("content").children[0].children[0].children[0].children[1].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].textContent;
  value = parseInt(value.replace("$",""));
  if(value > 0){
    return true;
  } else {
    return false;
  }
}

function join(data) {
  console.log(data);
  if(data.choice_data.savedText.length != undefined) {
    var multiple_choice_questions = data.choice_data.savedText;
    var multiple_choice_answers = data.choice_data.savedAnswers;
    for(var i = 0; i < multiple_choice_questions.length; i++) {
      var question_text = multiple_choice_questions[i];
      var answer_options = multiple_choice_answers[i];
      if(MC.savedText.length != 0) {
        if(MC.savedText.includes(question_text)) {
          multiple_choice.modifyAnswers(MC.savedAnswers[MC.savedText.indexOf(question_text)], answer_options.correctAnswers, answer_options.incorrectAnswers, answer_options.unknownAnswers);
        } else {
          multiple_choice.addQuestion(question_text, answer_options.correctAnswers, answer_options.incorrectAnswers, answer_options.unknownAnswers);
        }
      } else {
        multiple_choice.addQuestion(question_text, answer_options.correctAnswers, answer_options.incorrectAnswers, answer_options.unknownAnswers);
      }
    }
  }
  if(data.text_data.savedText.length != undefined) {
    var text_data_questions = data.text_data.savedText;
    var text_data_answers = data.text_data.savedAnswers;
    for(var i = 0; i < text_data_questions.length; i++) {
      var question_text = text_data_questions[i];
      var answer_text = text_data_answers[i].answer;
      if(TR.savedText.length != 0) {
        if(TR.savedText.includes(question_text)) {
          var user_question_version = TR.savedText.indexOf(question_text);
          if(TR.savedAnswers[user_question_version] == "") {
            text_response.modifyAnswers(question_text, answer_text);
          }
        } else {
          text_response.addQuestion(question_text, answer_text);
        }
      } else {
        text_response.addQuestion(question_text, answer_text);
      }
    }
  }
}

function save(exportName = "Gimkit.data") {
  var dataLink = document.createElement("a");
  var text = JSON.stringify({text_data:TR,choice_data:MC});
  var data = new Blob([text], {type: 'text/plain'});
  dataLink.setAttribute("download", exportName);
  var url = window.URL.createObjectURL(data);
  dataLink.href = url;
  dataLink.click();
}

function load(el) {
  if(el.files.length != 0) {
    var fr = new FileReader();
    fr.onload = () =>{
      join(JSON.parse(fr.result));
    };
    fr.readAsText(el.files[0]);
  }
}

var MC = {
  savedText: [],
  savedAnswers: []
};
var TR = {
  savedText: [],
  savedAnswers: []
};

var TOGGLESAVE = false;

var CURRENTQUESTION = null;
var CURRENTANSWER = null;
var RESULT = null;



function start() {
  document.addEventListener("keydown", (e)=>{
    if(e.keyCode == 27) {
      if(!TOGGLESAVE) {
        TOGGLESAVE = true;
        var saveEl = document.createElement("input");
        saveEl.style.backgroundColor = "#000000";

        saveEl.setAttribute("type", "button");
        saveEl.setAttribute("value","Save");
        saveEl.addEventListener("click", ()=> {save(prompt("Filename", "Gimkit.data"));});

        var bar = document.getElementById("content").children[0].children[0].children[0].children[0].children[0].children[0];
        bar.appendChild(saveEl);
        bar.insertBefore(saveEl, bar.children[bar.children.length-2]);



        var loadEl = document.createElement("input");

        loadEl.style.color = "transparent";
        loadEl.setAttribute("type", "file");
        
        loadEl.addEventListener("input", () => {
          load(loadEl);
        });

        bar.appendChild(loadEl);
        bar.insertBefore(loadEl, bar.children[bar.children.length-2]);
      } else {
        CURRENTQUESTION = get_question();
        if(CURRENTQUESTION.type == "multiple_choice") {
          multiple_choice.setUp();
          var eval = multiple_choice.answer(CURRENTQUESTION.text, CURRENTQUESTION.answer_options);
          multiple_choice.displayAnswers(eval);
        } else {
          text_response.setUp();
          var eval = text_response.answer(CURRENTQUESTION.text);
          text_response.displayAnswers(eval);
        }
      }
    }
    if(e.keyCode == 17 && e.location == 2) {
      save();
    }
  });
}

start();
