// import dependencies you will use
const express = require('express');
const path = require('path');
// set up variables to use packages
var myApp = express();
myApp.use(express.urlencoded({extended:false})); 

//set up validation packages
const {check, validationResult, body} = require('express-validator'); 

// set path to public folders and view folders
myApp.set('views', path.join(__dirname,'views'));
//use public folder for CSS etc.
myApp.use(express.static(__dirname + '/public'));
myApp.set('view engine', 'ejs');

// render the process page
myApp.get('/process',function(req, res){
    res.render('process'); // will render views/home.ejs
});

//set up the home page
myApp.get('/', function(req, res) {
    res.render('home', { items : itemList });
});

//class to set up product the items listed fields
class Product {
    constructor(name, price, quantity, input_Id ) {
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.input_Id = input_Id;
    }
}
//constants created for the Product information the the class fields
const black = new Product('Black',7.99,0, 'blackInput');
const brown = new Product('Brown', 9.99,0, 'brownInput');
const yellow = new Product('Yellow', 6.99,0, 'yellowInput');
const blue = new Product('Blue', 8.99 , 0, 'blueInput');

//creating array of the constants 
const itemList = [black, brown, yellow, blue];

//validation function
var phoneRegex = /^[0-9]{3}\-?[0-9]{3}\-?[0-9]{4}$/;
var emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

//function to check a value using regular expression
function checkRegex(userInput, regex){
    if(regex.test(userInput)){
        return true;
    }
    else{
        return false;
    }
}
// Custom phone validation function
function customPhoneValidation(value){
    if(!checkRegex(value, phoneRegex)){
        throw new Error('Phone should be in the format xxx-xxx-xxxx');
    }
    return true;
}

//province validation function
function provinceValidation(value, {req}){
    var province = req.body.province;
    if(value, province == "blank")
    {
        throw new Error('Please select Province');
    }
    else{
        return true;
    }
}

//function for custom email
function customEmailValidation(value, {req}){
    var email = req.body.email;
    if(!checkRegex(value, emailRegex))
    {
        throw new Error('Please enter email in correct format. eg: text@text.com');
    }
    return true;
}

myApp.post('/bill', [
    //check if the fields are validated
    check('fullName', 'Name is required').not().isEmpty(),
    check('address', 'Enter Canadian Address').not().isEmpty(),
    check('city', 'Enter City').not().isEmpty(),
    check('province', 'Enter Province/Territory').custom(provinceValidation),
    check('phone', 'Enter Phone').custom(customPhoneValidation),
    check('email', 'Enter Email Address').custom(customEmailValidation)
], function(req, res)
{
    //creating constant for the error message
    const errors = validationResult(req);
    //condition to check of the error message field is not empty
    if(!errors.isEmpty()){
    //fecthing the page products and errors
        res.render('home', {
            items : itemList,
            errors : errors.array()
        })
    }
    else{
    //store user input to variables
    var fullName = req.body.fullName;
    var address = req.body.address;
    var city = req.body.city;
    var province = req.body.province;
    var phone = req.body.phone;
    var email = req.body.email;

        //calculating the sub total of the products
        var subTotal = 0;
        //loop for the items in product
        for (var item of itemList)
        {
            //creating variable for quantity and storing user input
            var quantity = parseInt(req.body[item.input_Id]);
            //condition to check the quantity input is number and calculate
            if (isNaN(quantity))
            { 
                res.render('home', {
                    items : itemList,
                    productError: 'Enter a Number for Quantity'
                });
            }
            else{
                subTotal += quantity * item.price;
                
            }
        }  
        //condition for taxes according to province
        var tax;
        switch(req.body.province)
        {
        case 'AB':
            tax = 0.05;
        break;
        case 'BC':
             tax = 0.12;
        break;
        case 'MB':
             tax = 0.12;
        break;
        case 'NB':
            tax = 0.15;
        break;
         case  'NL':
            tax = 0.15;
        break;        
        case 'NS':
            tax = 0.15;
        break;
        case 'NU':
            tax = 0.05;
        break;
        case 'ON':
            tax = 0.13;    
        break;
        case  'PE':
            tax = 0.15;
        break;
        case 'QC':
            tax = 0.14;
        break;
        case 'SK':
             tax = 0.11;
         break;
        case 'YT':
            tax = 0.05;  
        break;         
        } 
        //calculate the tax 
        var taxAmount = subTotal * tax;
        //calculate the total
        var total = subTotal + taxAmount;

        //condition to check the total is greater than $10
        if(total < 10)
        {
            res.render('home', {
                items : itemList,
                productError: 'To Generate a Bill, the Purchase value Amount has to be greater than $10'
            });
        }
        else{
        //storing fields in an array
            var resultData = [];
            for(var item of itemList)
            {
                resultData.push({
                    productName: item.name, 
                    productQuantity: parseInt(req.body[item.input_Id]),
                    productPrice: item.price
                })
            }
            //storing fields in variable to display from the input
            var pageData = {
            resultName : fullName,
            resultAddress : address,
            resultCity : city,
            resultProvince : province,
            resultPhone : phone,
            resultEmail : email,
            resultTax : tax,
            resultTaxAmount : taxAmount,
            resultSubTotal : subTotal,
            resultTotal : total
            } 
        //Storing variable information on the process page 
            res.render('process', {
            pageData : pageData,
            resultData : resultData
            });
        }
    }
});
//connecting to the port 8080
myApp.listen(8080);

//checking if everything works fine
console.log('Everything executed fine.. website at port 8080....');