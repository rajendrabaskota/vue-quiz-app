Vue.component('headerr', {
    props: ['numcorrect', 'numtotal'],
    template: `
    <nav class="nav nav-tabs">
        <a class="nav-link disabled" href="#"><b>Fancy Quiz App</b></a>
        <a class="nav-link disabled" href="#">Counter: {{ numcorrect }}/{{ numtotal }}</a>
    </nav>
    `
})

Vue.component('questionbox', {
    props: ['currentquestion', 'increaseindex', 'increment'],
    data: function(){
        return {
            selectedIndex: null,
            shuffledAnswers: [],
            correctIndex: null,
            answered: false
        }
    },
    methods: {
        selectAnswer: function(index){
            this.selectedIndex = index;
        },
        shuffleAnswers: function(){
            this.correctIndex = Math.floor(Math.random()*4)
            var i;
            for(i=0; i<4; i++){
                if(i === this.correctIndex){
                    this.shuffledAnswers[i] = this.currentquestion.correct_answer
                    break
                }
                this.shuffledAnswers[i] = this.currentquestion.incorrect_answers[i]
            }
            for(let j=i; j<3; j++){
                this.shuffledAnswers[j+1] = this.currentquestion.incorrect_answers[j]
            }
        },
        submitAnswer: function(){
            let isCorrect = false
            if(this.selectedIndex === this.correctIndex){
                isCorrect = true
            }
            this.answered = true
            this.increment(isCorrect)
        },
        answerClass(index){
            let answerClass = 'list-group-item'
            if(!this.answered && this.selectedIndex === index){
                answerClass += ' selected'
            }else if(this.answered && (index === this.correctIndex)){
                answerClass += ' correct'
            }else if(this.answered && (this.selectedIndex === index) && (this.selectedIndex !== this.correctIndex)){
                answerClass += ' incorrect'
            }
            return answerClass

            // !answered && selectedIndex === index ? 'list-group-item selected' :
            //         answered && (selectedIndex === index) && (selectedIndex === correctIndex) ? 'list-group-item correct' :
            //         answered && (selectedIndex === index) && (selectedIndex !== correctIndex) ? 'list-group-item incorrect' : 'list-group-item'
        }
    },
    watch: {
        currentquestion: {
            immediate: true,
            handler: function(){
                this.selectedIndex = null
                this.shuffleAnswers()
                this.answered = false
            }
        }
    },
    computed: {
        answers: function(){
            let answers = [...this.currentquestion.incorrect_answers]
            answers.push(this.currentquestion.correct_answer)
            return answers
        }
    },
    created: function(){
        this.shuffleAnswers()
    },
    template: `
    <div class="question-box-container">
        <div class="jumbotron">
            {{currentquestion.question}}
            <hr class="my-4"></hr>

            <ul class="list-group">
                <li class="list-group-item"
                 v-for="(answer, index) in shuffledAnswers"
                 @click.prevent="!answered ? selectAnswer(index) : ''"
                 v-bind:class="answerClass(index)"
                >
                    {{answer}}
                </li>
            </ul>

            <button type="button" class="btn btn-primary"
                @click="submitAnswer"
                :disabled="selectedIndex===null || answered">
                Submit
            </button>

            <button type="button" v-on:click="increaseindex" class="btn btn-success">Next</button>
        </div>
    </div>
    `
})

new Vue({
    el: '#app',
    component: [
        'questionbox',
        'headerr'
    ],
    data: {
        questions: [],
        index: 0,
        numcorrect: 0,
        numtotal: 0
    },
    methods: {
        increaseindex: function(){
            this.index++
        },
        increment: function(isCorrect){
            if(isCorrect === true){ 
                this.numcorrect++ 
            }
            this.numtotal++
        }
    },
    mounted: function(){
        fetch('https://opentdb.com/api.php?amount=10&type=multiple', {
            method: 'get'
        })
        .then((response) => {
            return response.json()
        })
        .then((jsonData) => {
            this.questions = jsonData.results
        })
    }
})
