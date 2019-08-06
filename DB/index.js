const express = require('express');
const rp = require('request-promise');
const fs = require('fs');
let parser = require('xml2json');
let bodyParser = require("body-parser");
const BuildVendorReq = require("./BuildVendorReq.js");

const DBFunctions = require("./DBFunctions.js");
const util = require('util');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));


var AdminUserInfo = {
    'UserID' : "XMLAdmin10jlg6",
    'HomeID' : "88886648",
    'UserPassword':
    {
        'CryptType' : "None",
        'CrpytVal' : "Fiserv1$"
    },
    'Role':"Admin"
};
var FIInfo ={   
    'FIId' : "505001",
    'FIInfoRequired' : "FIIDInfoList"
};

const UserInfo = {
    'UserID' : 'CircleBlackUser10',
    'HomeID' : "88886648",
    'UserPassword' : {
        'CryptType' : 'None',
        'CryptVal' : 'cashedge1'
    },
    'Role':'User'
};
const NewUser = {
    "UserID" : "CircleBlackUser10",
    "HomeID" : "88886648",
    "UserPassword" : {
        "CryptType" : "None",
        "CryptVal" : "cashedge1"
    },
    "UserProfile" : {
    	
        "PersonInfo" : {
        	
            "NameAddrType": "Customer",
            
            "PersonName": {
               "FirstName" : "George",
                "LastName" : "Martin",
                "MiddleName" : "R.R."
            },
            
            "ContactInfo" :{
            	
                "PhoneNum" :{
                    "PhoneType" : "EveningPhone",
                    "Phone" : "4085432400"
                },
                
                "EmailAddr" :  "vijayrajkumark@cashedge.com",
                
                "PostAddr" : {
                    "Addr1" : "222 Somewhere Ave",
                    "Addr2" : "suit # 555",
                    "City": "Brooklyn",
                    "StateProv" : "New York",
                    "PostalCode" : "11203",
                    "Country" : "USA"
                }
            }
        }
    }
};






/**
 * @api {post} /api/SearchUser Check for user existence in database
 * @apiName SearchUser
 * @apiGroup User
 *
 *
 *
 * @apiSuccess {String} success "true".
 * @apiSuccess {String} message User login credentials have been validated
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "success" : "true",
 *         "message" : "User login credentials have been validated",
 *     }
 * 
 * @apiError {String} success "false".
 * @apiError {String} message "error message"
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *          "success" : "false",
 *          "message": "user does not exist"
 *     }
 * 
 */
app.post('/api/SearchUser',(req,res)=>{
    
    
    if(!req.body.user){
        return res.status(400).send({
            success: "false",
            message: "Username Required"
        })
    }
    if(!req.body.pass){
        return res.status(400).send({
            success: "false",
            message: "Password Required"
        })
    }
    DBFunctions.ValidateUserCred(req.body, function(valid,err){
        if(valid == "true")
            res.status(200).send({
                success : "true",
                message: "User login credentials have been validated"
            });
        else if (valid == "false"){
            return res.status(404).send({
                success : "false",
                message: err,
                data : req.body.user
            });
        }else if(valid == "error"){
            return res.status(500).send({
                success: "false",
                message : err
            })
        }else{
            return res.status(501).send({
                success: "false",
                message:"INTERNAL ERROR"
            })
        }
    });
    
});

/**
 * @api {post} /api/CreateUser Register a user into system database 
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiSuccess {String} success true
 * @apiSuccess {String} message user created successfully
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "success" : "true",
 *         "message" : "user created successfully",
 *     }
 * 
 * @apiError {String} success false
 * @apiError {String} message error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *          "success" : "false",
 *          "message": "user already exists"
 *     }
 * 
 */
app.post('/api/CreateUser',(req,res)=>{

    var reqJSON = req.body; 
    
    DBFunctions.StoreUser(reqJSON,function(valid,error){
        if(valid == "false"){
            return res.status(400).send({
                success : "false",
                message : error
            })
        }else if(valid == "true"){
            res.status(200).send({
                success : "true",
                message: "user created successfully"
            })
        }else{
            return res.status(500).send({
                success: "false",
                message : error
            })
        }
    });
   
});


app.get('/api/GetUserData/:sessionID',(req,res)=>{

    DBFunctions.GetUserData(req.param.sessionID,function(valid,err,result){
        if(valid == "false"){
            return res.status(400).send({
                success: "false",
                message: err
            })
        }else if(valid == "true"){
            res.status(200).send({
                success:"true",
                message: "user data retrieved",
                data : result
            })
        }else{
            return res.status(500).send({
                success:"false",
                message: err
            })
        }
    });
});

app.put('/api/UpdateUserData',(req,res)=>{

    DBFunctions.UpdateUserInfo(req.body,function(valid,err){
        if(valid == "false"){
            return res.status(400).send({
                success: "false",
                message:err
            })
        }else if(valid == "true"){
            res.status(200).send({
                success : "true",
                message : "User data updated"
            })
        }else{
            return res.status(500).send({
                success: "false",
                message : err
            })
        }
    });
});


/**
 * @api {post} /api/CreateVendorUser Register a user into the FiServ All Data system 
 * @apiName CreateVendorUser
 * @apiGroup User
 *
 * @apiParam {String} SessionID The unique user session ID
 * @apiParam {String} UserID Username of vendor account
 * @apiParam {String} CryptType Type of password
 * @apiParam {String} CryptVal Password for the vendor account
 * @apiParam  {String} NameAddrType "Customer" by default
 * @apiParam  {String} LastName Customer's last name
 * @apiParam  {String} FirstName Customer's first name
 * @apiParam  {String} MiddleName Customer's middle name
 * @apiParam  {String} PhoneType Customer's phone type(evening phone,day phone, home phone)
 * @apiParam  {String} PhoneNum Customer's phone number
 * @apiParam  {String} EmailAddr Customer's email address
 * @apiParam  {String} Addr1 Customer's home address
 * @apiParam  {String} Addr2 Customer's suite/apartment # if applicable
 * @apiParam  {String} City Customer's city address
 * @apiParam  {String} StateProv Customer's state address
 * @apiParam  {String} PostalCode Customer's postal code
 * @apiParam  {String} Country Customer's country location
 *
 * @apiSuccess {String} success "true".
 * @apiSuccess {String} message User login credentials have been validated.
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "success" : "true",
 *         "message" : "User Added Successfully",
 *      
 *     }
 * @apiError {String} success "false".
 * @apiError {String} message "error message"
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *          "success" : "false",
 *          "message": "query yielded 0 results"
 *     }
 * 
 */
app.post('/api/CreateVendorUser',(req,res)=>{
    
    BuildVendorReq.CreateVUser(req.body,function(valid ,err, options){
        if(valid == "false"){
            return res.status(500).send({
                success:"false",
                message: err
            })
        }else if(valid == "true"){
            rp(options)
                .then(function(parsedBody){
                    var resJSON = JSON.parse(parser.toJson(parsedBody));

                    if(resJSON.UserAddRsHeader.Status.StatusDesc == "Success"){
                        if(resJSON.UserAddRsHeader.SignonRs.Status.StatusDesc == "Success"){
                            if(resJSON.UserAddRsHeader.UserAddRs.Status.StatusDesc == "Success"){

                                DBFunctions.StoreVendorUser(req.body,resJSON, function(successful, error){
                                    if(successful == "true"){
                                        res.status(200).send({
                                            success: "true",
                                            message: "User Added Successfully"
                                           
                                        });
                                    }else{
                                        return res.status(400).send({
                                            success:"false",
                                            message: error
                                           
                                        });
                                    }
                                });
                            }
                            else{
                                return res.status(400).send({
                                    success: "false",
                                    message: resJSON.UserAddRsHeader.UserAddRs.Status.StatusDesc
                                    
                                });
                            }
                        }
                        else{
                            return res.status(400).send({
                                success: "false",
                                message: resJSON.UserAddRsHeader.SignonRs.Status.StatusDesc
                             
                            });
                        }
                    }
                    else{
                        return res.status(400).send({
                            success: "false",
                            message: resJSON.UserAddRsHeader.Status.StatusDesc
                        
                        });
                    }
            }).catch(function(err){
                if (err) return res.status(500).send({
                    success: "false",
                    message: "error with api call",
                    error: err
                });
            })
    }
    
    });
});




app.get('/api/GetFIList/:sessionID',(req,res)=>{
    DBFunctions.GetFI(req.params.sessionID,function(valid,err,data){
        if(valid == "false"){
            BuildVendorReq.GetFIInfoList(req.params.sessionID, function(valid,err,options){
               
                
                if(valid == "true"){
                
                    rp(options)
                        .then(function(parsedBody){
                            var resJson = JSON.parse(parser.toJson(parsedBody));
                            
                            if(resJson.FIInfoRsHeader.Status.StatusDesc == "Success"){
                                if(resJson.FIInfoRsHeader.SignonRs.Status.StatusDesc == "Success"){
                                    if(resJson.FIInfoRsHeader.FIInfoRs.Status.StatusDesc == "Success"){
                                        
                                        console.log("inside full success");
                                        DBFunctions.StoreFI(resJson,req.params.sessionID,function(stored,err){
                                            console.log("inside storefi");
                                            if(!stored){
                                                return res.status(500).send({
                                                    success:"false",
                                                    message:err
                                                })
                                            }else{
                                                res.status(200).send({
                                                    success:"true",
                                                    message:"data stored successfully and retrieved",
                                                    data: resJson
                                                })
                                            }

                                        });
                                    }
                                    else{
                                        return res.status(400).send({
                                            success: "false",
                                            message: resJson.FIInfoRsHeader.FIInfoRs.Status.StatusDesc,
                                            error: resJson
                                        });
                                    }
                                }
                                else{
                                    return res.status(400).send({
                                        success: "false",
                                        message: resJson.FIInfoRsHeader.SignonRs.Status.StatusDesc,
                                        error: resJson
                                    });
                                }
                            }
                            else{
                                return res.status(400).send({
                                    success: "false",
                                    message: resJson.FIInfoRsHeader.Status.StatusDesc,
                                    error: resJson
                                });
                            }
                           
                        })
                        .catch(function(err){
                            
                            if (err) return res.status(500).send({
                                success: "false",
                                message: "error with api call",
                                xmlReq : options,
                                error : err
                            });
                        });
                    
                }else{
                    return res.status(500).send({
                        success: "false",
                        message: err
                    });
                }
            });
        }else if(valid == "error"){
            return res.status(500).send({
                success: "false",
                message: err
            });
        }
        else if(valid == "true")
            res.status(200).send({
                success:"true",
                message: "data retreived from db successfully",
                data : data
            })
    });   
});


/**
 * @api {post} /api/CreateFIAccount Creat an account within the Fincancial Institution
 * @apiName CreateFIAccount
 * @apiGroup Financial Institution Account
 *
 * @apiParam {String} sessionID Unique sessionID to link data to proper user
 * @apiParam {String} FIId The Fincancial Institutions unique Id
 * @apiParam {String} TrustMode Low/Medium/High
 * @apiParam {String} ParamList A list of accounts the user wishes to log into
 * @apiParam (ParamList) {String} ParamName Name of the account
 * @apiParam (ParamList) {String} CryptType Type of encryption (default = None)
 * @apiParam (ParamList) {String} CyptVal The account password
 *
 *
 * @apiSuccess {String} success true
 * @apiSuccess {String} message User login credentials have been validated
 * @apiSuccess {String} data /Account Data/
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "success" : "true",
 *         "message" : "acocunt created successfully; data recieved",
 *         "data" : {
 *              //account data
 *         }
 *     }
 * @apiError {String} success false
 * @apiError {String} message error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *          "success" : "false",
 *          "message": "query yielded 0 results"
 *     }
 * 
 */
app.post('/api/CreateFIAccount',(req,res)=>{
    
    DBFunctions.GetHarvestAddID(req.body.sessionID,function(valid,err,HarvestAddID,RunID){
        if(valid == "true"){
            BuildVendorReq.GetAccountStatus(HarvestAddID,RunID,req.body.sessionID,function(valid,err,options){
                var GetNewAccount = false;
                if(valid == "true"){
                    rp(options)
                    .then(function(parsedBody){
                        var resJSON = JSON.parse(parser.toJson(parsedBody));
                        
                        if(resJSON.HarvestAddStsInqRsHeader.Status.StatusDesc == "Success"){
                            if(resJSON.HarvestAddStsInqRsHeader.SignonRs.Status.StatusDesc == "Success"){
                                if(resJSON.HarvestAddStsInqRsHeader.HarvestAddStsInqRs.Status.StatusDesc == "Success"){
                                    if(resJSON.HarvestAddStsInqRsHeader.HarvestAddStsInqRs.HarvestSts.HarvestRqStatus == "Completed"){
                                        DBFunctions.StoreHarvestID(HarvestAddStsInqRsHeader.HarvestAddStsInqRs.HarvestSts.HarvestID,req.body.sessionID,function(stored,err){
                                            if(!stored){
                                               return res.status(500).send({
                                                    success:"false",
                                                    message : err
                                                }) 
                                            }
                                        })
                                        GetNewAccount = true;
                                        
                                    }else if(resJSON.HarvestAddStsInqRsHeader.HarvestAddStsInqRs.HarvestSts.HarvestRqStatus == "InProgress"){
                                        res.status(204).send({
                                            success : "false",
                                            message : "account creationg is pending; try again in a bit"
                                        })
                                    }else if(resJSON.HarvestAddStsInqRsHeader.HarvestAddStsInqRs.HarvestSts.HarvestRqStatus == "TimedOut"){
                                        DBFunctions.DeleteHarvestInfo(req.body.sessionID,HarvestAddID,function(deleted,err){
                                            if(!deleted)
                                                res.status(500).send({
                                                    success:"false",
                                                    message:err
                                                })
                                            else
                                                res.status(204).send({
                                                    success:"false",
                                                    message:"account creation Timed Out; failed creation"
                                                })
                                        })
                                    }
                                   
                                }else{
                                    return  res.status(400).send({
                                        success : "false",
                                        message : resJSON.HarvestAddStsInqRsHeader.HarvestAddStsInqRs.Status.StatusDesc
                                        
                                    });
                                }
                            }else{
                                return res.status(400).send({
                                    success : "false",
                                    message : resJSON.HarvestAddStsInqRsHeader.SignonRs.Status.StatusDesc
                                    
                                });
                            }
                        }else{
                            return res.status(400).send({
                                success : "false",
                                message : resJSON.HarvestAddStsInqRsHeader.Status.StatusDesc
                               
                            });
                        }
                    })
                    .catch(function(err){
                        if (err) return res.status(500).send({
                            success: "false",
                            message: "error with api call",
                            error : err
                        });
                    })
                }
                else if(valid == "false"){
                    return res.status(400).send({
                        success:"false",
                        message: err
                    })
                }
                else{
                    return res.status(500).send({
                        success:"false",
                        message: err
                    })
                }

                if(GetNewAccount){
                    BuildVendorReq.GetNewAccount(HarvestAddId,RunId,req.body.sessionID,function(valid, err,options){
                        var CreateNewAccount = false;

                        if(valid == "true"){
                            rp(options)
                            .then(function(parsedBody){
                                var resJSON = JSON.parse(parser.toJson(parsedBody));
                               
                                if(resJSON.HarvestAddFetchRsHeader.Status.StatusDesc == "Success"){
                                    if(resJSON.HarvestAddFetchRsHeader.SignonRs.Status.StatusDesc == "Success"){
                                        if(resJSON.HarvestAddFetchRsHeader.HarvestAddFetchRs.Status.StatusDesc == "Success"){
                                            DBFunctions.StoreAcctData(resJSON,req.body.sessionID,function(stored,err){
                                                if(stored)
                                                    res.status(200).send({
                                                        success:"true",
                                                        message: "New Account data retrieved"
                                                    })
                                                else
                                                    res.status(500).send({
                                                        success:"false",
                                                        message:err
                                                    })
                                            })
                                            CreateNewAccount = true;
                                           
                                        }else{
                                            return res.status(400).send({
                                                success : "false",
                                                message : resJSON.HarvestAddFetchRsHeader.HarvestAddFetchRs.Status.StatusDesc
                                                
                                            });
                                        }
                                    }else{
                                        return res.status(400).send({
                                            success : "false",
                                            message : resJSON.HarvestAddFetchRsHeader.SignonRs.Status.StatusDesc
                                            
                                        });
                                    }
                                }else{
                                    return res.status(400).send({
                                        success : "false",
                                        message : resJSON.HarvestAddFetchRsHeader.Status.StatusDesc
                                        
                                    });
                                }
                            })
                            .catch(function(err){
                                if (err) return res.status(500).send({
                                    success: "false",
                                    message: "error with api call",
                                    error : err
                                });
                            })
                        }
                        else if(valid == "false"){
                            return res.status(400).send({
                                success:"false",
                                message: err
                            })
                        }
                        else{
                            return res.status(500).send({
                                success:"false",
                                message: err
                            })
                        }

                        if(CreateNewAccount){
                            BuildVendorReq.CreateAccount(HarvestAddId,RunId,req.body.sessionID,function(valid,err,options){
                                if(valid == "true"){
                                    rp(options)
                                    .then(function(parsedBody){
                                        var resJSON = JSON.parse(parser.toJson(parsedBody));
                                       
                                        if(resJSON.HarvestAddCreateAcctsRsHeader.Status.StatusDesc == "Success"){
                                            if(resJSON.HarvestAddCreateAcctsRsHeader.SignonRs.Status.StatusDesc == "Success"){
                                                if(resJSON.HarvestAddCreateAcctsRsHeader.HarvestAddCreateAcctsRs.Status.StatusDesc == "Success"){
                                                    
                                                    DBFunctions.StoreNewFILoginInfo(resJSON,req.body.sessionID,function(stored,err){
                                                        if(!stored){
                                                            return res.status(500).send({
                                                                success:"false",
                                                                message : err
                                                            })
                                                        }else{
                                                            DBFunctions.DeleteHarvestInfo(req.body.sessionID,HarvestAddID,function(deleted,err){
                                                                if(!deleted)
                                                                    res.status(500).send({
                                                                        success:"false",
                                                                        message:err
                                                                    })
                                                                else
                                                                    res.status(200).send({
                                                                        success:"true",
                                                                        message:"new account stored and created successfully!"
                                                                    })
                                                            })
                                                        }
                                                    });
                
                                                }else{
                                                    return res.status(400).send({
                                                        success : "false",
                                                        message : resJSON.HarvestAddCreateAcctsRsHeader.HarvestAddCreateAcctsRs.Status.StatusDesc
                                                       
                                                    });
                                                }
                                            }else{
                                                return res.status(400).send({
                                                    success : "false",
                                                    message : resJSON.HarvestAddCreateAcctsRsHeader.SignonRs.Status.StatusDesc
                                                 
                                                });
                                            }
                                        }else{
                                            return res.status(400).send({
                                                success : "false",
                                                message : resJSON.HarvestAddCreateAcctsRsHeader.Status.StatusDesc
                                                
                                            });
                                        }
                                    })
                                    .catch(function(err){
                                        if (err) return res.status(500).send({
                                            success: "false",
                                            message: "error with api call",
                                            error : err
                                        });
                                    })
                                }else if(valid == "false"){
                                    return res.status(400).send({
                                        success:"false",
                                        message: err
                                    })
                                }
                                else{
                                    return res.status(500).send({
                                        success:"false",
                                        message: err
                                    })
                                }

                            })
                        }
                    })
                }

            })
        }else if (valid == "false"){
            BuildVendorReq.InitiateAddAcc(req.body.sessionID,req.body.ParamList,function(valid, err,options){
                if(valid == "true"){
                    rp(options)
                    .then(function(parsedBody){
                        var resJSON = JSON.parse(parser.toJson(parsedBody));
                        
                        if(resJSON.HarvestAddRsHeader.Status.StatusDesc == "Success"){
                            if(resJSON.HarvestAddRsHeader.SignonRs.Status.StatusDesc == "Success"){
                                if(resJSON.HarvestAddRsHeader.HarvestAddRs.Status.StatusDesc == "Success"){
                                    
                                    DBFunctions.StoreFIHarvestData(req.body,resJSON.HarvestAddRsHeader.HarvestAddRs,function(valid, err){
                                        if(valid)
                                            res.status(200).send({
                                                success : "true",
                                                message : "FI account addition is successfully being process",
                                                response : resJSON
                                            });
                                        else
                                            return res.status(500).send({
                                                success:"false",
                                                message: err
                                            });
                                    })
                                }else{
                                    return res.status(400).send({
                                        success : "false",
                                        message : resJSON.HarvestAddRsHeader.HarvestAddRs.Status.StatusDesc,
                                        response: resJSON
                                    });
                                }
                            }else{
                                return res.status(400).send({
                                    success : "false",
                                    message : resJSON.HarvestAddRsHeader.SignonRs.Status.StatusDesc,
                                    response: resJSON
                                });
                            }
                        }else{
                            return res.status(400).send({
                                success : "false",
                                message : resJSON.HarvestAddRsHeader.Status.StatusDesc,
                                response: resJSON
                            });
                        }
                    })
                    .catch(function(err){
                        if (err) return res.status(500).send({
                            success: "false",
                            message: "error with api call",
                            error : err
                        });
                    })
                }else if(valid == "false"){
                    return res.status(400).send({
                        success:"false",
                        message: err
                    })
                }
                else{
                    return res.status(500).send({
                        success:"false",
                        message: err
                    })
                }
            })
        }else{
            return res.status(500).send({
                success : "false",
                message : err
            })
        }
    })
});






app.get('/api/GetAccount/Detail/:sessionID',(req,res)=>{
    
    BuildVendorReq.GetAcctDetails(req.param.sessionID,function(valid,err,options){
        if(valid == "true"){
            rp(options)
            .then(function(parsedBody){
                var resJSON = JSON.parse(parser.toJson(parsedBody));
                if(resJSON.FILoginAcctInfoListInqRsHeader.Status.StatusCode == "0"){
                    if(resJSON.FILoginAcctInfoListInqRsHeader.SignonRs.Status.StatusCode == "0"){
                        if(resJSON.FILoginAcctInfoListInqRsHeader.FILoginAcctInfoListInqRs.Status.StatusCode == "0"){
                                res.status(200).send({
                                    success : "true",
                                    message : "account detail retrieved",
                                    data : resJSON.FILoginAcctInfoListInqRsHeader.FILoginAcctInfoListInqRs.FILoginAcctInfoList
                                });
                        }else{
                            return res.status(400).send({
                                success : "false",
                                message : resJSON.FILoginAcctInfoListInqRsHeader.FILoginAcctInfoListInqRs.Status.StatusDesc
                            });
                        }
                    }else{
                        return res.status(400).send({
                            success : "false",
                            message : resJSON.FILoginAcctInfoListInqRsHeader.SignonRs.Status.StatusDesc
                        });
                    }
                 }else{
                    return res.status(400).send({
                        success : "false",
                        message : resJSON.FILoginAcctInfoListInqRsHeader.Status.StatusDesc
                    });
                }
            })
            .catch(function(err){
                return res.status(500).send({
                    success : "false",
                    message : "error with api call",
                    error : err
                })
            })
        }
        
    })
       
});

app.get('/api/GetAccount/Sum/:sessionID',(req,res)=>{

    if(!req.params.sessionID){
        return res.status(400).send({
            success:"false",
            message:"url parameter requires a 'sessionID'  parameter"
        })
    }else {
        BuildVendorReq.AccSum(req.query.sessionID,function(valid,err,options){
            if(valid == "true"){
                rp(options)
                .then(function(parsedBody){
                    var resJSON = JSON.parse(parser.toJson(parsedBody));
                    if(resJSON.FIAcctSummaryInqRsHeader.Status.StatusCode == "0"){
                        if(resJSON.FIAcctSummaryInqRsHeader.SignonRs.Status.StatusCode == "0"){
                            if(resJSON.FIAcctSummaryInqRsHeader.FIAcctSummaryInqRs.Status.StatusCode == "0"){
                                
                                DBFunctions.StoreAccSum(resJSON,function(stored,err){
                                    if(stored){
                                        res.status(200).send({
                                            success : "true",
                                            message : "account summary retrieved",
                                            data :data
                                        });
                                    }
                                    else{
                                        return res.status(500).send({
                                            success: "false",
                                            message : err
                                        })
                                    }
                                   
                                });
                            }else{
                                return res.status(400).send({
                                    success : "false",
                                    message : "could not refresh vendor response: "+resJSON.FIAcctSummaryInqRsHeader.FIAcctSummaryInqRs.Status.StatusDesc
                                });
                            }
                        }else{
                            return res.status(400).send({
                                success : "false",
                                message : "could not refresh vendor response: "+resJSON.FIAcctSummaryInqRsHeader.SignonRs.Status.StatusDesc
                            });
                        }
                    }else{
                        return res.status(400).send({
                            success : "false",
                            message : "could not refresh vendor response: "+resJSON.FIAcctSummaryInqRsHeader.Status.StatusDesc
                        });
                    }
                })
                .catch(function(err){
                    return res.status(500).send({
                        success : "false",
                        message : "could not refresh: error with api call",
                        error : err
                    })
                })
            }
        })
    }
});

app.get('/api/GetAccount/Trans/:sessionID',(req,res)=>{
    
    if(AccTrans == "null"){
        

        rp(options)
            .then(function(parsedBody){
                var resJSON = JSON.parse(parser.toJson(parsedBody));
                if(resJSON.DepAcctTrnInqRsHeader.Status.StatusCode == "0"){
                    if(resJSON.DepAcctTrnInqRsHeader.SignonRs.Status.StatusCode == "0"){
                        if(resJSON.DepAcctTrnInqRsHeader.DepAcctTrnInqRs.Status.StatusCode == "0"){
                            
                            DBFunctions.StoreAccTrans(resJSON);

                            var AccTransData = DBFunctions.GetAccTrans(req.param.sessionID);

                            if(AccTransData == "null" || AccTransData =="error"){
                                return res.status(500).send({
                                    success :"false",
                                    message : "INTERNAL ERROR"
                                });
                            }
                            else{
                                res.status(200).send({
                                    success : "true",
                                    message : "account transactions retrieved",
                                    data : AccTransData
                                });
                            } 
                        }else{
                            return res.status(400).send({
                                success : "false",
                                message : resJSON.DepAcctTrnInqRsHeader.DepAcctTrnInqRs.Status.StatusDesc
                            });
                        }
                    }else{
                        return res.status(400).send({
                            success : "false",
                            message : resJSON.DepAcctTrnInqRsHeader.SignonRs.Status.StatusDesc
                        });
                    }
                }else{
                    return res.status(400).send({
                        success : "false",
                        message : resJSON.DepAcctTrnInqRsHeader.Status.StatusDesc
                    });
                }
            })
            .catch(function(err){
                return res.status(500).send({
                    success : "false",
                    message : "error with api call",
                    error : err
                })
            })

    }else if(AccTrans == "error"){
        return res.status(500).send({
            success : "false",
            message : "INTERNAL ERROR"
        })
    }else{
        res.status(200).send({
            success:"true",
            message:"Account summary retrieved successfully",
            data : AccTrans
        })
    }


});



app.delete('/api/DeleteAccount/User/:sessionID',(req,res)=>{
   

    rp(options)
        .then(function(parsedBody){
            var resJSON = JSON.parse(parser.toJson(parsedBody));
            if(resJSON.UserDelRsHeader.Status.StatusCode == "0"){
                if(resJSON.UserDelRsHeader.SignonRs.Status.StatusCode == "0"){
                    if(resJSON.UserDelRsHeader.UserDelRs.Status.StatusCode == "0"){
                        
                        var deletionComplete = DBFunctions.DeleteUser(req.param.sessionID);
                        
                        if(deletionComplete){
                            res.status(200).send({
                                success:"true",
                                message : "User Deleted Successfully"
                            })
                        }else{
                            return res.status(500).send({
                                success:"false",
                                message : "User could not be deleted"
                            })
                        }

                    }else{
                        return res.status(400).send({
                            success : "false",
                            message : resJSON.UserDelRsHeader.UserDelRs.Status.StatusDesc
                        })
                    }
                }else{
                    return res.status(400).send({
                        success : "false",
                        message : resJSON.UserDelRsHeader.SignonRs.Status.StatusDesc
                    });
                }
            }else{
                return res.status(400).send({
                    success : "false",
                    message : resJSON.UserDelRsHeader.Status.StatusDesc
                });
            }
        })
        .catch(function(err){
            return res.status(500).send({
                success: "false",
                message: "error with api call",
                error : err
            })
        })
});

app.delete('/api/DeleteAccount/FI/sessionID',(req,res)=>{
  
    rp(options)
        .then(function(parsedBody){
            var resJSON = JSON.parse(parser.toJson(parseBody));

            if(resJSON.FIDeleteRsHeader.Status.StatusCode == "0"){
                if(resJSON.FIDeleteRsHeader.SignonRs.Status.StatusCode == "0"){
                    if(resJSON.FIDeleteRsHeader.FIDeleteRs.Status.StatusCode == "0"){
                        var deletionComplete = DBFunctions.DeleteAccount(req.param.sessionID);
                        if(deletionComplete){
                            res.status(200).send({
                                success : "true",
                                message : "Financial Institution deleted successfully"
                            })
                        }else{
                            return res.status(500).send({
                                success : "false",
                                message : "FI could not be deleted due to an unknown error"
                            })
                        }
                    }else{
                        return res.status(400).send({
                            success : "false",
                            message : resJSON.FIDeleteRsHeader.FIDeleteRs.Status.StatusDesc
                        })
                    }
                }else{
                    return res.status(400).send({
                        success : "false",
                        message : resJSON.FIDeleteRsHeader.SignonRs.Status.StatusDesc
                    })
                }
            }else{
                return res.status(400).send({
                    success : "false",
                    message : resJSON.FIDeleteRsHeader.Status.StatusDesc
                })
            }
        })
        .catch(function(err){
            return res.status(500).send({
                success:"false",
                message : "error calling vendor api",
                error : err
            })
        })
});

app.delete('/api/DeleteAccount/FI/Account',(req,res)=>{
    

    rp(options)
        .then(function(parsedBody){
            var resJSON = JSON.parse(parser.toJson(parseBody));

            if(resJSON.FIDeleteRsHeader.Status.StatusCode == "0"){
                if(resJSON.FIDeleteRsHeader.SignonRs.Status.StatusCode == "0"){
                    if(resJSON.FIDeleteRsHeader.FIDeleteRs.Status.StatusCode == "0"){
                        var deletionComplete = DBFunctions.DeleteAccount(req.query.sessionID, req.query.id);
                        if(deletionComplete){
                            res.status(200).send({
                                success : "true",
                                message : "Financial Institution deleted successfully"
                            })
                        }else{
                            return res.status(500).send({
                                success : "false",
                                message : "FI could not be deleted due to an unknown error"
                            })
                        }
                    }else{
                        return res.status(400).send({
                            success : "false",
                            message : resJSON.FIDeleteRsHeader.FIDeleteRs.Status.StatusDesc
                        })
                    }
                }else{
                    return res.status(400).send({
                        success : "false",
                        message : resJSON.FIDeleteRsHeader.SignonRs.Status.StatusDesc
                    })
                }
            }else{
                return res.status(400).send({
                    success : "false",
                    message : resJSON.FIDeleteRsHeader.Status.StatusDesc
                })
            }
        })
        .catch(function(err){
            return res.status(500).send({
                success:"false",
                message : "error calling vendor api",
                error : err
            })
        })
});




const port = process.env.PORT || 3000;
app.listen(port,()=> console.log(`Listening on ${port} ...`));