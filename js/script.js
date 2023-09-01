//selecting all required elements
const start_btn = document.querySelector(".start_btn button");
const info_box = document.querySelector(".info_box");
const quiz_box = document.querySelector(".quiz_box");
const result_box = document.querySelector(".result_box");
const option_list = document.querySelector(".option_list");
const time_line = document.querySelector("header .time_line");
const timeText = document.querySelector(".timer .time_left_txt");
const timeCount = document.querySelector(".timer .timer_sec");
const resultline = document.querySelector(".complete_text");
let questions = {};
let APIData={};
let user='';
const next_btn = document.querySelector("footer .next_btn");
const bottom_ques_counter = document.querySelector("footer .total_que");
let timeValue =  20;
let que_count = 0;
let que_numb = 1;
let userScore = 0;
let counter;
let counterLine;
let widthValue = 0;

const quit_quiz = result_box.querySelector(".buttons .quit");

document.getElementById('registration-form')?.addEventListener('submit', function(event) {
    event.preventDefault();

    let userName = document.getElementById('user-name').value;

    let email = document.getElementById('email').value;

    let numberOfQuestions = document.getElementById('number-question').value;

    let level = document.querySelector('input[name="level"]:checked');

    let questionCategory = document.querySelector('input[name="category"]:checked');

    // Check if User Name is empty
    if (!userName.trim()) {

      displayError(new Error('User Name must not be empty.'));

      return;

    }

    user = userName;

    // Check if Email is empty
    if (!email.trim()) {

      displayError(new Error('Email must not be empty.'));

      return;

    }

    // Check if Email is in the correct format (contains "@" and ends with ".com")
    if (!isValidEmail(email)) {

      displayError(new Error('Please enter a valid email address.'));

      return;

    }

    // Check if Category is not selected
    if (!questionCategory) {

      displayError(new Error('Please select a category.'));

      return;

    }


    // Check if Level is not selected
    if (!level) {

      displayError(new Error('Please select a difficulty level.'));

      return;

    }

    // Check if Number of Questions is empty or less than 5
    if (!numberOfQuestions || numberOfQuestions < 5) {

        displayError(new Error('Please select at least 5 questions.'));
  
        // Clear the input field
        numberOfQuestions.value = '';
  
        return;
  
      }

    fetch('https://opentdb.com/api.php?amount='+ numberOfQuestions + ' &category= ' + questionCategory.value + '&difficulty=' + level.value +'&type=' + 'multiple')
    .then(function(response) {
        if (!response.ok) {
            throw new Error(response.status);
        }
        return response.json();

    })
    .then(function(data) {
        APIData=data.results;
        modifyAPIData(data.results);
        info_box.classList.remove("activeInfo"); //hide info box
        quiz_box.classList.add("activeQuiz"); //show quiz box
        showQuetions(0); //calling showQestions function
        queCounter(1); //passing 1 parameter to queCounter
        startTimer(20); //calling startTimer function
        startTimerLine(0); //calling startTimerLine function
    })

    .catch(function(error) {
        displayError(error);
    });

});

function isValidEmail(email) {

    // Regular expression for a simple email validation (contains "@" and ends with ".com")
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);

  }



function displayError(error) {
    let errorMsg='Error: ' + error.message;
    alert(errorMsg);
}


// if startQuiz button clicked
start_btn.onclick = ()=>{
    info_box.classList.add("activeInfo"); //show info box
}

// if quitQuiz button clicked
quit_quiz.onclick = ()=>{
    window.location.reload(); //reload the current window
}



// if Next Que button clicked
next_btn.onclick = ()=>{
    if(que_count < questions.length - 1){ 
        que_count++;
        que_numb++; 
        showQuetions(que_count); 
        queCounter(que_numb); 
        clearInterval(counter); 
        clearInterval(counterLine); 
        startTimer(timeValue); 
        startTimerLine(widthValue); 
        timeText.textContent = "Time Left"; 
        next_btn.classList.remove("show");
    }else{
        clearInterval(counter); 
        clearInterval(counterLine); 
        showResult(); 
    }
}

// getting questions and options from array
function showQuetions(index){
    const que_text = document.querySelector(".que_text");

    //creating a new span and div tag for question and option and passing the value using array index
    let que_tag = '<span>'+ (           index+1) + ". " + questions[index].question +'</span>';
    let option_tag = '<div class="option"><span>'+ questions[index].options[0] +'</span></div>'
    + '<div class="option"><span>'+ questions[index].options[1] +'</span></div>'
    + '<div class="option"><span>'+ questions[index].options[2] +'</span></div>'
    + '<div class="option"><span>'+ questions[index].options[3] +'</span></div>';
    que_text.innerHTML = que_tag; 
    option_list.innerHTML = option_tag; 
    
    const option = option_list.querySelectorAll(".option");

    // set onclick attribute to all available options
    for(i=0; i < option.length; i++){
        option[i].setAttribute("onclick", "optionSelected(this)");
    }
}
// creating the new div tags which for icons
let tickIconTag = '<div class="icon tick"><i class="fas fa-check"></i></div>';
let crossIconTag = '<div class="icon cross"><i class="fas fa-times"></i></div>';

//if user clicked on option
function optionSelected(answer){
    clearInterval(counter); 
    clearInterval(counterLine); 
    let userAns = normalizeString(answer.textContent); 
    let correcAns = normalizeString(questions[que_count].answer); 
    const allOptions = option_list.children.length; 
    
    if(userAns == correcAns){ 
        userScore += 1; 
        answer.classList.add("correct"); 
        answer.insertAdjacentHTML("beforeend", tickIconTag); 
    }else{
        answer.classList.add("incorrect"); 
        answer.insertAdjacentHTML("beforeend", crossIconTag); 

        for(i=0; i < allOptions; i++){
            let modOption = option_list.children[i].textContent.toLowerCase();
            if(modOption == correcAns){ 
                option_list.children[i].setAttribute("class", "option correct"); 
                option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag); 
            }
        }
    }
    for(i=0; i < allOptions; i++){
        option_list.children[i].classList.add("disabled"); 
    }
    next_btn.classList.add("show"); 
}

function showResult(){
    info_box.classList.remove("activeInfo");
    quiz_box.classList.remove("activeQuiz"); 
    result_box.classList.add("activeResult"); 
    finalResult();
    const scoreText = result_box.querySelector(".score_text");
    if (userScore > 3){ 
        let scoreTag = '<span>and congrats! 🎉, You got <p>'+ userScore +'</p> out of <p>'+ questions.length +'</p></span>';
        scoreText.innerHTML = scoreTag;  
    }
    else if(userScore > 1){ 
        let scoreTag = '<span>and nice 😎, You got <p>'+ userScore +'</p> out of <p>'+ questions.length +'</p></span>';
        scoreText.innerHTML = scoreTag;
    }
    else{ 
        let scoreTag = '<span>and sorry 😐, You got only <p>'+ userScore +'</p> out of <p>'+ questions.length +'</p></span>';
        scoreText.innerHTML = scoreTag;
    }
}

function startTimer(time){
    counter = setInterval(timer, 1000);
    function timer(){
        timeCount.textContent = time;
        time--; 
        if(time < 9){ 
            let addZero = timeCount.textContent; 
            timeCount.textContent = "0" + addZero; 
        }
        if(time < 0){ 
            clearInterval(counter);
            timeText.textContent = "Time Off"; 
            const allOptions = option_list.children.length; 
            let correcAns = questions[que_count].answer; 
            for(i=0; i < allOptions; i++){
                if(option_list.children[i].textContent == correcAns){ 
                    option_list.children[i].setAttribute("class", "option correct"); 
                    option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag); 
                }
            }
            for(i=0; i < allOptions; i++){
                option_list.children[i].classList.add("disabled"); 
            }
            next_btn.classList.add("show"); 
        }
    }
}

function startTimerLine(time){
    counterLine = setInterval(timer, 29);
    function timer(){
        time += 0.85    ; 
        time_line.style.width = time + "px";
        if(time > 549){ 
            clearInterval(counterLine); 
        }
    }
}

function queCounter(index){
    let difficulty=questions[0].difficulty;
    //creating a new span tag and passing the question number and total question
    let totalQueCounTag = '<span><p>'+ index +'</p> of <p>'+ questions.length +'</p> Questions | '+ difficulty +'</span>';
    bottom_ques_counter.innerHTML = totalQueCounTag;  
}

function modifyAPIData(unmodQues){
    let newModQues=unmodQues.map((set,index)=>{
        let setIncorrect_ans=set.incorrect_answers;
        let setCorrect_ans=set.correct_answer;
        let optionsArray= Object.values({...setIncorrect_ans,setCorrect_ans});
        shuffleArray(optionsArray); 
        return{
            "numb":index+1,
            "question":set.question,
            "answer":set.correct_answer,
            "options": optionsArray,
            "difficulty": set.difficulty

        };
    });
    questions=newModQues;
}

function shuffleArray(array) 
{
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); 
        [array[i], array[j]] = [array[j], array[i]]; 
    }
}

function normalizeString(input) {
    const entityMapping = {
        '&039;': "'", 
        '&lt;': '<', 
        '&gt;': '>', 
        
    };

    // Replace HTML entities with corresponding characters
    for (const entity in entityMapping) {
        if (entityMapping.hasOwnProperty(entity)) {
            const character = entityMapping[entity];
            const entityRegExp = new RegExp(entity, 'g');
            input = input.replace(entityRegExp, character);
        }
    }

    return input.toLowerCase();
}   

function finalResult(){
    resultline.innerHTML= user + ", you've completed the Quiz!";
}
