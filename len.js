define([
    "qlik",
    "text!./template.html",
    "css!./style.css",
    "jquery",
    "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.min.js",
], function (qlik, template, css) {
    'use strict';
    $("<style>").html(css).appendTo("head");

    const DropdownSelect = {
        ref: "prop.objectID",
        type: "string",
        label: "Select an Option",
        component: "dropdown",
        options: [
            {
                "value": "Act as a Data Analyst,",
                "label": "Act as a Analyst"
            },
            {
                "value": "Option2",
                "label": "Act as user"
            }
        ],
    };
	
	  const Key = {
        ref: "prop.Key",
         label: "Enter AI Key",
         type: "string",
         expression: "optional",
		  defaultValue:"iIlAMndlLC6KyAnSNRBMAI6IAkToikpWf7wDCyi9tRNGIaHr"
    };




    let appearanceSection = {
        uses: "settings",
        items: {
            objectID: DropdownSelect,
			key: Key,
            ButtonInfo: {
                type: "items",
                label: "Object Setting",

                items: {
                    objects: {
                        ref: "objects",
                        label: "Enter Object Ids",
                        type: "string",
                        expression: "optional"
                    },
                    promptBox: {
                        ref: "prop.promptBox",
                        component: "textarea",
                        label: "Enter PrePrompt for Analytics Role",
                        type: "string",
						maxlength : 2000,
                        defaultValue: "You are a highly skilled health insurance business analyst. Utilize the JSON data provided below after 'data:', which includes information claims data. Your primary objective is to analyze this data and answer the query asked after the data segment in query:<> format in this message. Always emphasize clarity and correctness in your answers to provide the best possible insights. Respond in HTML div format, dont send string ```html in response",
                      
                    },
					    promptBox_Hr: {
                        ref: "prop.promptBox_Hr",
                        component: "textarea",
                        label: "Enter PrePrompt for Hr Leader Role",
                        type: "string",
                        defaultValue: "You are a highly skilled HR leader specializing in talent management and organizational development. Utilize the JSON data provided below after 'data:', which includes employee performance metrics. Your primary objective is to analyze this data and answer the query asked after the data segment in query:<> format in this message. Always emphasize clarity and correctness in your answers to provide the best possible insights. Respond in HTML format.  please dont send string ```html in response"
                    },
					      promptBox_Consultant: {
                        ref: "prop.promptBox_Consultant",
                        component: "textarea",
                        label: "Enter PrePrompt for Consultant Role",
                        type: "string",
                        defaultValue: "You are a highly skilled business consultant with expertise in strategic planning and market analysis. Utilize the JSON data provided below after 'data:', which includes market research findings. Your primary objective is to analyze this data and answer the query asked after the data segment in query:<> format in this message. Always emphasize clarity and correctness in your answers to provide the best possible insights. Respond in HTML format. please dont send string ```html in response"
                    }
                }
            }
        }
    };

    const fetchData = async (model, currentPage, pageSize, totalColumns, totalRows) => {
        const qTop = currentPage * pageSize;
        const qHeight = pageSize;

        const data = await model.getHyperCubeData('/qHyperCubeDef', [{
            qTop: qTop,
            qLeft: 0,
            qWidth: totalColumns,
            qHeight: totalRows,
        }]);
        //console.log("Gender Data",model);
        return data[0].qMatrix;
    };




    return {
        template: template,
	
        definition: {
            type: "items",
            component: "accordion",
            label: "Object Setting",
            items: {
                appearance: appearanceSection,

            }
        },
        support: {
            snapshot: true,
            export: true,
            exportData: false
        },

        paint: function ($element, layout) {




            var app = qlik.currApp(this);
			
			var cur_sid = qlik.navigation.getCurrentSheetId();

			qlik.currApp(this).getObjectProperties(cur_sid.sheetId).then(function(model){

			 // console.log("current sheet title:" + model.properties.qMetaDef.title);
			  $("#welcome_msg").text(model.properties.qMetaDef.title);

			});
	var chatHistory =[];
				if (chatHistory.length === 0) {
                $('#download-button').prop('disabled', true); // Disable button if no chat history
				$('#download-button').addClass('disabled-btn');
            }
            /*	var Object_ids = [];
                            var currentSheetId = qlik.navigation.getCurrentSheetId();
        
        
                            app.getAppObjectList( 'sheet', function(reply){  
                                    $.each(reply.qAppObjectList.qItems, function(key, value) {
                                        if(currentSheetId.sheetId==value.qInfo.qId){  
                                	
                                        $.each(value.qData.cells, function(k,v){
                                    	
                                        console.log(v);
                                    	
                                            Object_ids.push(v.name);
                                    	
                                        });
                                      }
        
        
                                 });
                                //console.log("str",Object_ids);
                            }); */


            const objects = layout.objects;
            const PrePrompt = layout.prop.objectID;
			 const Key = layout.prop.Key;
			var promptBox = layout.prop.promptBox;
            let question = document.getElementById("question");
			var ans_container_class;
			
			$(document).ready(function () {
   // $('#roleSelect').val("Analyst").change(); // Set default to Analyst and trigger change event
	
	    $('.role-container .role-btn.selected').click();
});

var role_var ;

	  $('.role-btn').on('click', function() {
        // Remove 'selected' class from all buttons
        $('.role-btn').removeClass('selected');
        // Add 'selected' class to the clicked button
        $(this).addClass('selected');
		role_var = $(this).text();

        // Change the styles of the #question input box based on the clicked button
        switch ($(this).text()) {
            case "Data Analyst":
                /*$("#question").css({
                    'border': '2px solid lightblue',
                    'box-shadow': '1px 1px 5px 1px #dbe7ed inset'
                });*/
                promptBox = layout.prop.promptBox; // Assuming layout is defined elsewhere
				ans_container_class = "ans_analyst";
                break;
            case "Hr Leader":
              /*  $("#question").css({
                    'border': '2px solid #568c67',
                    'box-shadow': '1px 1px 5px 1px #a2c2a2 inset'
                });*/
                promptBox = layout.prop.promptBox_Hr; // Assuming layout is defined elsewhere
				ans_container_class = "ans_hr";
                break;
            case "Business Consultant":
                /*$("#question").css({
                    'border': '2px solid #cf9ade',
                    'box-shadow': '1px 1px 5px 1px #c77cc3 inset'
                });*/
                promptBox = layout.prop.promptBox_Consultant; // Assuming layout is defined elsewhere
				ans_container_class = "ans_consultant";
                break;
            default:
                $("#question").css("background-color", ""); // Reset to default if no role is selected
                promptBox = layout.prop.promptBox; // Assuming layout is defined elsewhere
                break;
        }
    });



            const elements = objects.split(',').map(item => item.trim());

            const myArrayObjects = [];

            elements.forEach(element => myArrayObjects.push(element));
            //console.log("layout",layout);

            var AppName;

			
			// Inside the paint function, after defining the input area
const roleSelect = document.getElementById("roleSelect");




            const fetchDataAndProcess = async (objectID) => {
                const jsonDataArray = [];


                await app.getObject(objectID).then(async (model) => {
                    const layout = model.layout;
                    const totalDimensions = layout.qHyperCube.qDimensionInfo.length;
                    const totalMeasures = layout.qHyperCube.qMeasureInfo.length;
                    //AppName = model.app.layout.qTitle;
                    const totalColumns = totalDimensions + totalMeasures;
                    const pageSize = 1000;
                    const totalRows = layout.qHyperCube.qSize.qcy;
                    const totalPages = Math.ceil(totalRows / pageSize);

                    //	console.log("layout", model.layout);



                    question.setAttribute("placeholder", `Ask Question related to this sheet object `);

                    //const dimensionHeaders = layout.qHyperCube.qDimensionInfo.map(dimension => dimension.qFallbackTitle);
                    const dimensionHeaders = layout.qHyperCube.qDimensionInfo.map(dimension => {
                        //	  console.log("dimension", dimension); // Afișează fiecare obiect dimension pentru a vedea toate proprietățile disponibile
                        return dimension.qFallbackTitle;

                    });
                    //const measureHeaders = layout.qHyperCube.qMeasureInfo.map(measure => measure.qFallbackTitle);
                    const measureHeaders = layout.qHyperCube.qMeasureInfo.map(measure => {
                        //	console.log("measure", measure);
                        return measure.qFallbackTitle;
                    });
                    //console.log(dimensionHeaders);
                    //console.log(measureHeaders);


                    const headers = dimensionHeaders.concat(measureHeaders).filter(fieldName => fieldName !== undefined);
                    //console.log(headers);

                    for (let currentPage = 0; currentPage < totalPages; currentPage++) {
                        const dataMatrix = await fetchData(model, currentPage, pageSize, totalColumns, totalRows);
                        dataMatrix.forEach(data => {
                            const jsonData = {};
                            headers.forEach((header, index) => {
                                //console.log("header",header);
                                //console.log("header data",data);

                                jsonData[header] = data[index]?.qText;
                            });
                            jsonDataArray.push(jsonData);
                        });
                    }
                });



                //console.log("qlik objects data",jsonDataArray);
                return jsonDataArray;
            };




            let openChat = document.getElementById("openChat");
            let closeChat = document.getElementById("closeChat");



            let conversation = [];
            let sursa = [];


            openChat.onclick = function () {


                $("#myForm").show();


                if ($('#GPTAnswear').html().trim() === '') {
                    (async () => {
                        try {
                          //  const result = await callOpenAI("hi", "8k", "prompt");

                            $('#GPTAnswear').scrollTop($('#GPTAnswear')[0].scrollHeight);
                        } catch (error) {
                            //console.error("Error calling OpenAI:", error);
                        }
                    })();
                } else {
                    //	console.log('The div is not empty.');
                }




            }



            const chatContainer = document.getElementById("GPTAnswear");

            let containerArea = document.getElementById('questionArea').clientHeight;
            containerArea -= 150;
            chatContainer.style.height = `${containerArea}px`;

            let btn = document.getElementById("btn");

// Function to convert a string to an ArrayBuffer
function stringToArrayBuffer(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

// Function to convert an ArrayBuffer to a string
function arrayBufferToString(buffer) {
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
}

// Function to generate a key
async function generateKey() {
    return await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true, // extractable
        ["encrypt", "decrypt"]
    );
}

// Function to encrypt the key
async function encryptKey(key, secret) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        stringToArrayBuffer(secret)
    );
    return { encrypted: new Uint8Array(encrypted), iv: iv }; // Return encrypted data and IV
}

// Function to decrypt the key
async function decryptKey(key, encryptedData, iv) {
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        encryptedData
    );
    return arrayBufferToString(decrypted); // Return decrypted string
}


            // Example usage


            const openai_api_key = Key;
//console.log(openai_api_key);
            async function callOpenAI(inputText, context = '4o', inputType = 'prompt') {
 const secretKey = layout.prop.Key; // Get the key from layout.prop
    const cryptoKey = await generateKey(); // Generate a cryptographic key

    // Encrypt the key
    const { encrypted, iv } = await encryptKey(cryptoKey, secretKey);
    console.log("Encrypted Key:", encrypted);

    // Decrypt the key
    const decryptedKey = "iIlAMndlLC6KyAnSNRBMAI6IAkToikpWf7wDCyi9tRNGIaHr";
 //   console.log("Decrypted Key:", decryptedKey);

                const baseUrl = "https://stg1.mmc-dallas-int-non-prod-ingress.mgti.mmc.com/coreapi/openai/v1/";

                let model;
                if (context === '8k') {
                    model = "mmc-tech-gpt-35-turbo-smart-latest";
                } else if (context === '16k') {
                    model = 'mmc-tech-gpt-35-turbo-16k-0613';
                } else if (context === '4o') {
                    model = "mmc-tech-gpt-4o-mini-128k-2024-07-18";
                }

                const endpoint = `deployments/${model}/chat/completions`;
                const url = `${baseUrl}${endpoint}`;
                const temp = 0.2; // Ranges 0-2

                inputText = inputText.slice(0, 125000 * 5);




                // Use regular expressions to extract the values
                //	var selectMatch = inputText.match(/select\s+(.*?)\s+from/);
                //var fromMatch = inputText.match(/from\s+(.+)/);

                var selectMatch = inputText.match(/select\s+(.*?)\s+from/i);
                var fromMatch = inputText.match(/from\s+(.+)/i);

                // Initialize variables
                var valueAfterSelect = selectMatch ? selectMatch[1] : null; // This will be "Dental"
                var valueAfterFrom = fromMatch ? fromMatch[1] : null; // This will be "Benefit Type"


                //	console.log(valueAfterSelect,valueAfterFrom);
                if (valueAfterSelect != null && valueAfterFrom != null) {

                    app.field(valueAfterFrom).selectValues([valueAfterSelect], false, true);

                }

                else {


                    let allObjData = [];
                    myArrayObjects.forEach(function (objectID) {
                        fetchDataAndProcess(objectID).then(jsonDataArray => {
                            allObjData.push(jsonDataArray);

                            //console.log("all Obejcets Data", allObjData);
                            sursa = JSON.stringify(allObjData);


                            console.log("all Obejcets Data in string", sursa);
                        }).catch(error => {
                           // console.error("Error fetching and processing data:", error);
                        });

                    });



                    // console.log(sursa);

                    const barChart = `Use the HTML <canvas> tag to display charts, ensuring to close the tag properly.
					Utilize the Chart.js library, but do not include the <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> line, 
					as it is already included in the head section. Assign a unique ID to each chart. If the user requests for 'charts' in query, 
					display 5-6 charts; if they request for  'chart' in query, display only one. For larger datasets, divide the data into chunks to create the charts. 
					Generate any type of chart. In the script, 
					avoid using the variable name 'ctx'; instead, use different any random names for all variables unrelated to the data`


//console.log("promptBox testing",promptBox);
                    const prompt = `${PrePrompt} ${promptBox}`;

                    let payload;
                    var newtext;
                    if (inputText.includes("chart")) {
                       // console.log("chart");

                        $("canvas").parents(".ans-chat").siblings(".copy-response").remove();
                        $(".ans-chat-container .ans-chat canvas").remove();




                        newtext = inputText + barChart;
                    } else {
                        newtext = inputText;
                    }

                 //   console.log(newtext);

                    //console.log("out FUntion", sursa);
                    if (inputType === 'prompt') {
                        payload = {
                            model: model,
                            messages: [
                                {
                                    role: "user",
                                    content: `${prompt} data:${sursa} query:${newtext}`
                                }
                            ],
                            temperature: temp
                        };
                    }

//console.log(decryptedKey);
                    const headers = {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${decryptedKey}`
                    };

                    try {
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify(payload)
                        });


                        if (!response.ok) {
                            // Handle specific status codes
                            if (response.status == 502) {
                                let div_ans_container_err = document.createElement('div');

                                div_ans_container_err.className = "ans-chat-container";
                                let div_err = document.createElement('div');

                                div_err.className = "ans-chat";
                                div_err.innerHTML = "Could not find response server";
                                div_ans_container_err.append(div_err);
                                chatContainer.append(div_ans_container_err);
                            } else {
                              //  console.log(`HTTP error! status: ${response.status}`);
                            }
                        }

                        const data = await response.json();
                        if (inputType === 'chat') {
                            //	console.log(response);
                        }

						$(".ans-chat-container").find("script").remove();
                        const output = data.choices[0].message.content;
						let output_msg;
						
						document.getElementById("data_set").innerHTML = output;
						
						const keywords = ["compaire", "compare"];
						if (keywords.some(keyword => newtext.includes(keyword))) {
						
						let data_src = $("#data_set").text().trim();
						
						//console.log("compare data src", data_src);
						 //let data_src = JSON.stringify(output);
						 let prompt_compaire = data_src + " for given data give response on query "+ newtext + "Please respond in HTML format and dont send '```html' in response output";
						   let pload = {
                            model: "mmc-tech-gpt-4o-mini-128k-2024-07-18",
                            messages: [
                                {
                                    role: "user",
                                    content: `${prompt_compaire}`
                                }
                            ],
                            temperature: 0.2
                        };
								try {
								       const res = await fetch(url, {
											method: 'POST',
											headers: headers,
											body: JSON.stringify(pload)
										});
										
										

                      				  const data_cmp = await res.json();
									  output_msg = data_cmp.choices[0].message.content;
									  
									  
					//	console.log("compare data", output_msg);
									  

						let user_div = document.createElement('div');
                        user_div.className = "user-div";
                        user_div.innerHTML = `<i class='fa fa-user-circle' aria-hidden='true'></i> <span class="role_span">${role_var}</span>`;

		
						let div_ans_triangle = document.createElement('div');
						div_ans_triangle.className = `ans-triangle ${ans_container_class}`;
		
						let div_ans_hearResponse = document.createElement('div');
						div_ans_hearResponse.className = "hear-responce";
		
						let hear_btn = document.createElement('button');
                        hear_btn.className = "speak-button";
                        hear_btn.innerHTML = "<i class='fa fa-volume-up' aria-hidden='true'></i>";
     				    div_ans_hearResponse.append(hear_btn);
	   
                        let div_ans_container = document.createElement('div');

                        div_ans_container.className = `ans-chat-container ${ans_container_class}`;
                        let copy_btn = document.createElement('button');
                        copy_btn.className = "copy-response";
                        copy_btn.innerHTML = "<i class='fa fa-copy'></i>";
						div_ans_hearResponse.append(copy_btn);
                        let div_ans = document.createElement('div');

                        div_ans.className = "ans-chat";
                        div_ans.innerHTML = output_msg;
						
                        div_ans_container.append(div_ans)
						div_ans_container.append(div_ans_hearResponse);
						chatContainer.append(user_div);
						chatContainer.append(div_ans_triangle);
                        chatContainer.append(div_ans_container);
						// To get the text content of div_ans
						let textContent = div_ans.textContent; // or div_ans.innerText
						chatHistory.push({ "query": newtext, "response": textContent });
									  
										
									} catch (error) {
										// Handle the error if parsing fails
										//console.error("Error parsing JSON:", error.message);
									}
						 
						 }else{
						 output_msg = output;
						 
					
						
					//	output = output.replace(/^\`\`\`html\s*|\s*\`\`\`$/g, '');

					//	console.log(output_msg);


						let user_div = document.createElement('div');
                        user_div.className = "user-div";
                        user_div.innerHTML = `<i class='fa fa-user-circle' aria-hidden='true'></i> <span class="role_span">${role_var}</span>`;

		
						let div_ans_triangle = document.createElement('div');
						div_ans_triangle.className = `ans-triangle ${ans_container_class}`;
		
						let div_ans_hearResponse = document.createElement('div');
						div_ans_hearResponse.className = "hear-responce";
		
						let hear_btn = document.createElement('button');
                        hear_btn.className = "speak-button";
                        hear_btn.innerHTML = "<i class='fa fa-volume-up' aria-hidden='true'></i>";
     				    div_ans_hearResponse.append(hear_btn);
	   
                        let div_ans_container = document.createElement('div');

                        div_ans_container.className = `ans-chat-container ${ans_container_class}`;
                        let copy_btn = document.createElement('button');
                        copy_btn.className = "copy-response";
                        copy_btn.innerHTML = "<i class='fa fa-copy'></i>";
						div_ans_hearResponse.append(copy_btn);
                        let div_ans = document.createElement('div');

                        div_ans.className = "ans-chat";
                        div_ans.innerHTML = output_msg;
						
                        div_ans_container.append(div_ans)
						div_ans_container.append(div_ans_hearResponse);
						chatContainer.append(user_div);
						chatContainer.append(div_ans_triangle);
                        chatContainer.append(div_ans_container);
						
						
							let textContent = div_ans.textContent; // or div_ans.innerText
						chatHistory.push({ "query": newtext, "response": textContent });





						 $("#dynamic_script").html('');
						 $("#dynamic_script").remove();
						 
						let script_data = $(".ans-chat-container:last-child").find("script").map(function() {
							return $(this).html();
						}).get().join("\n");
						
						 $(".ans-chat-container:last-child").find("script").html('');

         				 function loadScript(url) {



                            var script = document.createElement("script");
                            script.type = "text/javascript";
                            script.innerHTML = url;
                            script.id = "dynamic_script";


                            // Append the script to the head or body
                            document.body.append(script);
                        }



                        if (inputText.includes("chart")) {
						  // Select all .ans-chat-container except the last one
							$(".ans-chat-container:not(:last-child)").each(function() {
								// Check if the current .ans-chat-container has a <script> tag
								if ($(this).find("script").length > 0) {
									// If it does, remove the .ans-chat div within it
									$(this).find(".ans-chat").remove();
								}
							});
							
							
							 
							 setTimeout(function(){
							
										loadScript(script_data); // Replace with your script URL
								
							 
							 },1000);
                            
                            //$(".ans-chat-container:last-child").find(".ans-chat").find("script:last-child").remove();

$(".ans-chat-container").css("width","500px");
                        }else{
						$(".ans-chat-container").css("width","fit-content");
						}
						
					
                            
					}

                        // Load Chart.js dynamically
						
						if (chatHistory.length === 0) {
                $('#chatHistory').html('No chat history available.');
                $('#download-button').prop('disabled', true); // Disable button if no chat history
            }else{
			      $('#download-button').prop('disabled', false); // Disable button if no chat history
				  $('#download-button').removeClass('disabled-btn');
			}

                        return output_msg;
						
  				//	console.log("chat message",chatHistory);


                    } catch (error) {
                        if (error.message.includes('502')) {
                            //console.error('Bad Gateway: The server is currently unavailable. Please try again later.');
                            let div_ans_container_err = document.createElement('div');

                            div_ans_container_err.className = "ans-chat-container";
                            let div_err = document.createElement('div');

                            div_err.className = "ans-chat";
                            div_err.innerHTML = "Could not find response dur server error";
                            div_ans_container_err.append(div_err);
                            chatContainer.append(div_ans_container_err);
                        }
                        if (data && data.error) {
                            // Error handling for too many tokens
                            if (data.error.message.includes('maximum context length is')) {
                                return callOpenAI(inputText.slice(0, inputText.length / 2), context, inputType);
                                alert(error);
                            }

                            // Error handling for repetitive values
                            if (data.error.message.includes('repetitive patterns')) {
                                const textAsList = inputText.split(' ');
                                const valCounts = {};

                                // Count occurrences of each word
                                textAsList.forEach(val => {
                                    valCounts[val] = (valCounts[val] || 0) + 1;
                                    alert(valCounts[val]);
                                });

                                const toReplace = Object.keys(valCounts).filter(val => valCounts[val] > 100);

                                inputText = textAsList.filter(x => !toReplace.includes(x)).join(' ');

                                return callOpenAI(inputText, context, inputType);
                            }

                            // console.log(inputText);
                            //	console.log(data);
                            return "Could not find response\n\n";



                        }

                        let div_ans_container_err = document.createElement('div');

                        div_ans_container_err.className = "ans-chat-container";
                        let div_err = document.createElement('div');

                        div_err.className = "ans-chat";
                        div_err.innerHTML = "Could not find response dur server error";
                        div_ans_container_err.append(div_err);
                        chatContainer.append(div_ans_container_err);
                    }

                }

                return "An unexpected error occurred.";
            }



            btn.onclick = function () {

				let div_que_triangle = document.createElement('div');
						div_que_triangle.className = "que-triangle";
                let div = document.createElement('div');



						let user_div = document.createElement('div');
                        user_div.className = "user-div";
                        user_div.innerHTML = `<span class="que_role_span"> </span><i class='fa fa-user-circle' aria-hidden='true'></i>`;

                if ($('#question').val().trim() == '') {
                    alert("please enter text");
                } else {
                    div.className = "question-chat";
					  let div_que = document.createElement('div');
					  div_que.className = "que-div";
                    div_que.textContent = question.value;
					
                    div.append(user_div);


                    div.append(div_que_triangle);
					   div.append(div_que);

                    chatContainer.append(div);
					
					
								var global = qlik.getGlobal(this);
								global.getAuthenticatedUser(function(reply){
								
									var inputString = reply.qReturn;

									var userIdMatch = inputString.match(/UserId=([^;]+)/);

									var userId = userIdMatch ? userIdMatch[1] : null;

									//console.log(userId);

									$(".que_role_span").text(userId);
								});

                    //Loader
                    let div_ans_container = document.createElement('div');
                    div_ans_container.className = 'load-chat-container';

                    let isTypingDiv = document.createElement('div');
                    isTypingDiv.className = 'is-typing';

                    for (let i = 1; i <= 5; i++) {
                        let jumpDiv = document.createElement('div');
                        jumpDiv.className = 'jump' + i;
                        isTypingDiv.appendChild(jumpDiv);
                    }
                    div_ans_container.appendChild(isTypingDiv);

                    chatContainer.appendChild(div_ans_container);

                    isTypingDiv.style.display = 'flex';

                    (async () => {
                        try {
                            const result = await callOpenAI(question.value, "4o", "prompt");

                            $('#GPTAnswear').scrollTop($('#GPTAnswear')[0].scrollHeight);

                            isTypingDiv.style.display = 'none';
                        } catch (error) {

                            isTypingDiv.style.display = 'none';
                            //	console.error("Error calling OpenAI:", error);
                        }
                    })();



                    $('#question').val(" ");


                    $('#GPTAnswear').scrollTop($('#GPTAnswear')[0].scrollHeight);

                }
            }


            /* $("#question").keypress(function (e) {
             
                               var code = e.keyCode || e.which;
                               if (code === 13) {
                                   e.preventDefault();
                                       let div = document.createElement('div');
                               div.className = "question-chat";
                               div.textContent = question.value;
                               chatContainer.append(div);
                               	
                           	
                                       (async () => {
                                           try {
                                           const result = await callOpenAI(question.value, "4o", "prompt");
                                                        $('#GPTAnswear').scrollTop($('#GPTAnswear')[0].scrollHeight);
                                               console.log(result);
                                           } catch (error) {
                                               console.error("Error calling OpenAI:", error);
                                           }
                                       })();
                                   	
                                   	
                               $('#question').val(''); 
                           	
                               }
               });		*/



            $(document).on('keydown', function (event) {
                // Check if Ctrl (or Command on Mac) and C are pressed
                if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
                    // Prevent the default copy action
                    event.preventDefault();

                    // Get the selected text
                    const selection = window.getSelection();
                    const selectedText = selection.toString();

                    // If there is selected text, copy it to the clipboard
                    if (selectedText) {
                        navigator.clipboard.writeText(selectedText).then(() => {

                        }).catch(err => {

                        });
                    }
                }
            });


            closeChat.onclick = function () {
                $("#myForm").hide();

                $('#GPTAnswear').html('');
            }

$(document).ready(function() {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Your browser does not support speech recognition.");
    } else {
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Keep recognizing until stopped
        recognition.interimResults = false; // Show interim results

        const $transcriptInput = $('#question'); // Use jQuery to select the input
        const $startButton = $('#startRecognition'); // Use jQuery to select the button
        let isRecognizing = false; // Flag to track recognition state

        // Start/stop recognition
        $startButton.on('click', function() {
            if (isRecognizing) {
                recognition.stop(); // Stop recognition
                $startButton.html('<i class="fas fa-microphone"></i>'); // Change icon back to microphone
				$startButton.css("background-color","#177fe6");
            } else {
                recognition.start(); // Start recognition
                $startButton.html('<i class="fas fa-stop"></i>'); // Change icon to stop
				$startButton.css("background-color","#c31437");
            }
            isRecognizing = !isRecognizing; // Toggle the recognition state
			
			//console.log("Button clicked. Is recognizing: " + isRecognizing);
        });

        // Handle results
        recognition.onresult = function(event) {
            event.preventDefault();
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            $transcriptInput.val(transcript); // Display the recognized text using jQuery
			$transcriptInput.focus(); 
        };

        // Handle errors
        recognition.onerror = function(event) {
            //console.error('Error occurred in recognition: ' + event.error);
        };

        // Handle end of recognition
        recognition.onend = function() {
           // console.log('Speech recognition service disconnected');
            // Reset the button icon and state
            $startButton.html('<i class="fas fa-microphone"></i>'); // Change icon back to microphone
			$startButton.css("background-color","#177fe6");
            isRecognizing = false; // Reset the recognition state
        };
    }
});

            const inputBox = document.getElementById('question');

            // Add an event listener for the 'keydown' event
            inputBox.addEventListener('keydown', function (event) {
                // Check if the pressed key is the Enter key
                if (event.key === 'Enter') {
                    // Prevent the default action (which may trigger recognition.start())
                    event.preventDefault();


                    if ($('#question').val().trim() == '') {
                   //     alert("please enter text");
				   //console.log("enter text");
                    } else {
                        $("#btn").click();
                    }
                    //$("#btn").click();
                    // Optionally, you can add any other logic you want to execute on Enter key press
                }
            });

            //response voice start code
            $(document).ready(function () {
                let isSpeaking = false;
                let speechSynthesis = window.speechSynthesis;
                let utterance;
                speechSynthesis.cancel();
                $(document).on('click','.speak-button', function () {
				var text = $(this).parent().prev().text().trim();
                    if (isSpeaking) {
                        stopSpeech(this);
                    } else {
                        startSpeech(text,this);
                    }
                });

                function startSpeech(text,$this) {
                    // Get the text from the textarea
                    


                    // Check if the browser supports speech synthesis
                    if ('speechSynthesis' in window) {
                        // Create a new speech synthesis utterance
                        var utterance = new SpeechSynthesisUtterance(text);
                        isSpeaking = true;

                        // Optionally set properties like voice, pitch, and rate
                        utterance.pitch = 1; // Range: 0 to 2
                        utterance.rate = 1;  // Range: 0.1 to 10
                        utterance.volume = 1; // Range: 0 to 1

                        // Speak the text
                        window.speechSynthesis.speak(utterance);

                        $($this).html('<i class="fa fa-ban" aria-hidden="true"></i>');
                        $($this).addClass("active-speech");


                        utterance.onend = function () {
                            isSpeaking = false;
                            $($this).html('<i class="fa fa-volume-up" aria-hidden="true"></i>');
                            $($this).removeClass("active-speech");
                        }

                    } else {
                        alert('Please enter some text to speak.');
                    }
                }

                function stopSpeech($this) {
                    if (isSpeaking) {
                        speechSynthesis.cancel();
                        isSpeaking = false;
						    $($this).html('<i class="fa fa-volume-up" aria-hidden="true"></i>');
                            $($this).removeClass("active-speech");
                      
                    }
                }
                $(window).on('beforeunload', function () {
                    stopSpeech();
                });
            });

            //response copy code

            $(document).on("click", ".copy-response", function () {
                // Get the parent div
                const parentDiv = $(this).closest('.ans-chat-container').find(".ans-chat");

                // Get all text inside the child elements of the parent div
                const textToCopy = parentDiv.text().trim();

                // Create a temporary textarea to hold the text to copy
                const tempInput = $('<textarea>').val(textToCopy).appendTo('body').select();

                // Copy the text
                document.execCommand('copy');

                // Remove the temporary textarea
                tempInput.remove();

                // Optional: Alert the user that the text has been copied
                //console.log('Text copied to clipboard!');
            });
			
			 function appendChartScript(chartType, data, labels) {
               
                    const ctx = document.getElementById('myChart').getContext('2d');
                    const myChart = new Chart(ctx, {
                        type: chartType,
                        data: {
                            labels: JSON.stringify(labels),
                            datasets: [{
                                label: 'My Dataset',
                                data: JSON.stringify(data),
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    });
                ;
            }
			
			


        $(document).ready(function() {
       
// Function to download chat history as a Word file
function downloadChat() {
           // Initialize the Word document content
                let docContent = '<html xmlns:w="urn:schemas-microsoft-com:office:word">' +
                                 '<head><meta charset="utf-8"></head><body>';
		//console.log("chat data",chatHistory);
                // Loop through each chat entry in the array
                chatHistory.forEach(entry => {
                    docContent += `<p><strong>User:</strong> ${entry["query"]}<br>` +
                                  `<strong>Bot:</strong> ${entry["response"]}</p>`;
                });

                // Close the HTML tags
                docContent += '</body></html>';

                // Create a Blob from the HTML
                const blob = new Blob([docContent], { type: 'application/msword' });

                // Create a link element
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = 'chat_history.doc'; // Name of the file

                // Append to the body
                document.body.appendChild(link);
                
                // Trigger the download
                link.click();
                
                // Remove the link after triggering the download
                document.body.removeChild(link);
}

		
		$("#download-button").click(function(){
			downloadChat();
		});

});

		//document.getElementById('download-button').addEventListener('click', downloadChat);

		
            return qlik.Promise.resolve();
        }
    };
});





