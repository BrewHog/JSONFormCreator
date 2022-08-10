/*
https://JSON-Form-Transformer.brewhog.repl.co
REQUIREMENTS
- Bulma is required for this to work properly. Current version used when developing was 0.9.4

FORM REQUIREMENTS FROM THE JSON OBJECT
- "testName" field is required. This is used for the test name
- If an object is chosen as a value, you have a few optional parameters to use
    - 


- Goal for this project is to be able to convert back and forth from JSON -> HTML Forms
- You should also have the ability to create a data structure from UI elements (Form Creator) - Long Term
- (High Priority) Take a JSON object and turn it in to a form
- Everything should be completely heirarchical

*/

let exampleJSON = {
    "testTitle": "Example Test",
    "Session": {
        "sessionId": "ID of a session",
        "resumed": "true",
        "closed": "false",
        "subSession": {
            "testing": "Aha"
        }
    },
    "arraysWillBeOptionDropdown": [  // Arrays are treated as dropdowns
        "Option1",
        "Bugwah"
    ],
    "assignee": "Justin Emilio",  
}

class jsonForm {
    constructor(parentId, initJSON) {
        this.json = {};
        if (typeof initJSON != "undefined") {
            console.log("Init JSON produced:");
            console.log(initJSON);
            this.json = initJSON;
        }
        this.parentId = parentId;
        this.parentEl = document.getElementById(this.parentId);
        this.parentEl.id = "json-form-parent";

        this.outputLeft = null;
        this.outputRight = null;

        this.outputEl = this.createParentOutputEl(this.parentEl);

        this.processForm();


        //console.log("Parent element: ",this.parentEl);

    }

    //Initialize the HTML and create all the proper elements in the DOM
    createParentOutputEl(el) {
        //Give reference to 'this' for any out of scope functions
        let self = this;

        let output = document.createElement("div");
        el.appendChild(output);

        output.id = "json-form-output";
        output.classList.add("columns");

        self.outputLeft = document.createElement("div");
        self.outputLeft.id = "json-form-output-left";
        self.outputLeft.classList.add("column");
        self.outputLeft.innerText = "JSON Input";

        self.outputRight = document.createElement("div");
        self.outputRight.id = "json-form-output-right";
        self.outputRight.classList.add("column");
        self.outputRight.innerText = "Form Output";

        output.appendChild(self.outputLeft);
        output.appendChild(self.outputRight);

        let jsonTextArea = this.createJSONTextArea(self.outputLeft);


        return output;
    }
    
    createJSONTextArea(el) {
        //Give reference to 'this' for any out of scope functions
        let self = this;

        let br = document.createElement("br");
        let ta = document.createElement("textarea");
        ta.style.width = "100%";
        ta.style.minHeight = "400px";
        ta.style.border = "0px solid white";
        ta.style.backgroundColor = "lightgray";
        ta.style.paddingLeft = "3px";
        ta.setAttribute("spellcheck", "false");

        let taMessage = document.createElement("span");
        taMessage.style.color = "red";

        el.appendChild(br);
        el.appendChild(ta);
        el.appendChild(taMessage);
        ta.innerHTML = JSON.stringify(self.json, undefined, 4);


        ta.addEventListener('keydown', function(e) {
            function isValidJSON(jsonObj) {
                try {
                    JSON.parse(jsonObj);
                    return true;
                } catch (e) {
                    return false;
                }
            }

            if (e.key == 'Tab') {
                e.preventDefault();
                var start = this.selectionStart;
                var end = this.selectionEnd;

                // set textarea value to: text before caret + tab + text after caret
                this.value = this.value.substring(0, start) +
                    "\t" + this.value.substring(end);

                // put caret at right position again
                this.selectionStart =
                    this.selectionEnd = start + 1;
            }
            if (e.key == 'Enter') {
                if (isValidJSON(this.value)) {
                    let oLen = this.value.length;
                    e.preventDefault();
                    let newVal = JSON.parse(this.value);
                    self.json = newVal;

                    this.value = JSON.stringify(newVal, undefined, 4);
                }
            }

        });

        ta.addEventListener('keyup', function(e) {
            function isValidJSON(jsonObj) {
                try {
                    JSON.parse(jsonObj);
                    return true;
                } catch (e) {
                    return false;
                }
            }

            if (isValidJSON(ta.value)) {
                self.json = JSON.parse(ta.value);
                ta.style.boxShadow = "3px 3px green";
                ta.style.backgroundColor = "lightgray";
                //this.innerHTML = JSON.stringify(JSON.parse(this.value),undefined,4);

                taMessage.style.color = "green";
                taMessage.innerText = "Valid JSON";

                //console.log(self);
                self.processForm();

            } else {
                ta.style.boxShadow = "7px 7px red";
                ta.style.backgroundColor = "#fce6e3";
                taMessage.style.color = "red";
                taMessage.innerText = "Not valid JSON. Please try again.";
            }

        });


        return ta;
    }

    processObjectItemForForm(name, obj, parentEl) {

        for (let prop in obj) {
            if (typeof obj[prop] == "object"){ continue; }
            let newContainer = document.createElement("div");
            newContainer.style.width = "100%";
            newContainer.style.paddingLeft = "15px";

            let newLabel = document.createElement("span");
            newLabel.innerText = prop;


            let newInput = null;
            switch (obj[prop]) {
                case "true":
                    newInput = document.createElement('input');
                    newInput.setAttribute('type', 'checkbox');
                    newInput.checked = true;
                    newInput.id = prop;
                    newLabel.style.paddingLeft = "3px";
                    newContainer.appendChild(newInput);
                    newContainer.appendChild(newLabel);
                    break;

                case "false":
                    newInput = document.createElement('input');
                    newInput.setAttribute('type', 'checkbox');
                    newInput.checked = false;
                    newInput.id = prop;
                    newLabel.style.paddingLeft = "3px";
                    newContainer.appendChild(newInput);
                    newContainer.appendChild(newLabel);
                    break;

                default:
                    newInput = document.createElement("input");
                    newInput.classList.add("input");
                    newInput.classList.add("is-small");
                    newInput.id = prop;
                    newInput.placeholder = obj[prop];
                    newContainer.appendChild(newLabel);
                    newContainer.appendChild(newInput);


            }

            parentEl.appendChild(newContainer);


        }

    }

    processArrayForForm(name, items, parentEl) {
        //give reference to 'this' for any out of scope functions
        let self = this;

        console.log("Process Array called");

        let newContainer = document.createElement("div");

        let newLabel = document.createElement("span");
        newLabel.innerText = name;

        let newInput = document.createElement("select");
        newInput.classList.add("select");
        newInput.classList.add("is-small");
        newInput.id = name;

        for(let i=0;i<items.length;i++) {
            let opt = document.createElement("option");
            opt.text = items[i];
            opt.value = items[i];
            newInput.add(opt);
            
        }
        

        let br = document.createElement("br");
        newContainer.appendChild(br);
        newContainer.appendChild(newLabel);
        newContainer.appendChild(br);
        newContainer.appendChild(newInput);
        parentEl.appendChild(newContainer);

    }

    processItemForForm(name, item, parentEl) {
        //give reference to 'this' for any out of scope functions
        let self = this;

        console.log("Process Item called");

        let newContainer = document.createElement("div");

        let newLabel = document.createElement("span");
        newLabel.innerText = name;

        let newInput = document.createElement("input");
        newInput.classList.add("input");
        newInput.classList.add("is-small");
        newInput.id = name;
        newInput.placeholder = item;

        newContainer.appendChild(newLabel);
        newContainer.appendChild(newInput);
        parentEl.appendChild(newContainer);

    }

    loopSubObj(obj, level, parentEl) {
        //give reference to 'this' for any out of scope functions
        let self = this;
        let currLevel = level + 1;

        for (let prop in obj) {
            if (Array.isArray(obj[prop])) {
                //console.log("| " + "--".repeat(level) + "> " + prop + " = Array");
            } else {
                //console.log("| " + "--".repeat(level) + "> " + prop + " = " + typeof obj[prop]);
            }

            if (typeof obj[prop] == 'object') {
                if (Array.isArray(obj[prop])) {
                    //console.log("Arrays are not supported");
                    let newEl = document.createElement("div");
                    parentEl.appendChild(newEl);
                    self.processArrayForForm(prop,obj[prop],newEl);
                    continue;
                } else {
                    let newTitle = document.createElement("span");
                    newTitle.style.fontSize = "18pt";
                    newTitle.innerText = prop;
                    parentEl.appendChild(newTitle);
                    
                    let newEl = document.createElement("div");
                    newEl.style.paddingLeft = "15px";
                    parentEl.appendChild(newEl);
                    
                    
                    self.processObjectItemForForm(prop, obj[prop], newEl);
                    self.loopSubObj(obj[prop], currLevel, newEl);

                }

            } else {
                //Item is not an object, and not an array
                //You can process this item and put on a form (If it's valid)

                if (level == 0) {
                    self.processItemForForm(prop, obj[prop], parentEl);
                }

            }
        }

    }

    processForm() {
        //give reference to 'this' for any out of scope functions
        let self = this;

        let currLevel = 0;

        self.outputRight.innerHTML = "";

        //Loop recursively through all properties
        self.loopSubObj(self.json, currLevel, self.outputRight);

        //console.log("Process Form", self.outputRight.innerHTML);
    }



}



let newForm = new jsonForm("json-form-output", exampleJSON);



//newForm.parentEl.innerText = "Haha. This is a test";















