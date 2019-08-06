const fs = require('fs');
const getData = require('./GetData.js');
const data = fs.readFileSync('CIrcleBlack.postman_collection.json');
const DBFunctions = require("./DBFunctions.js");
const util = require('util');

let xml2js = require('xml2js'),
    toXML = new xml2js.Builder({headless :true,renderOpts:{'pretty':false}}),
    toJSON = new xml2js.Parser({explicitArray:false});

let parser = require('xml2json'),
    jsonData = JSON.parse(data);


var exports = module.exports;



exports.GetFIInfoList = function(sessionID,callback){
    
    DBFunctions.GetVendorAdminInfo(sessionID,function(valid,err,data){
        if(valid == "true"){
            var AdminInfo = {};
            AdminInfo.UserID = data.User_Id;
            AdminInfo.HomeID = data.Home_Id;
            AdminInfo.UserPassword = {};
            AdminInfo.UserPassword.CryptType = data.Password_CryptType;
            AdminInfo.UserPassword.CryptVal = data.Password_CryptValue;
            AdminInfo.Role = data.Role;

            toJSON.parseString(jsonData.item[1].request.body.raw, function(err,result){
                if(err){
                    return callback("false",err,null);
                }else{
                    let optionList = [];
                 
                    delete result.FIInfoRqHeader.SignonRq.UserInfo;
                    result.FIInfoRqHeader.SignonRq.UserInfo = AdminInfo;
                    result.FIInfoRqHeader.FIInfoRq.FIId = '505001'
                    result.FIInfoRqHeader.FIInfoRq.FIInfoRequired = "FIIDInfoList";
                  
                    var postdata = toXML.buildObject(result);
                    var options = {
                        method: 'POST',
                        uri: jsonData.item[1].request.url.raw,
                        headers:
                        {'content-type':'application/xml'},
                        body: postdata
                    };
                    
                    callback("true", null , options);
                }
            });
        }else{
            return callback("false",err,null);
        }
    });
};


exports.VUser = function(){

};

exports.AccSum = function(sID,callback){
    var ReqInfo = DBFunctions.GetAccSumInfo(sID);

};

exports.AccTrans = function(sID){
    var ReqInfo = DBFunctions.GetAccTransInfo(sID);
};

exports.GetAcctDetails = function(sID,callback){
    DBFunctions.GetAcctDetInfo(sID,function(valid,err,data){
        if(valid == "true"){
            toJSON.parseString(jsonData.item[8].request.body.raw,function(err,result){
                if(err)
                    return callback("false",err,null)
                else{
                    var UserInfo = {};
                    UserInfo.UserID = data.User_Id;
                    UserInfo.HomeID = data.Home_Id;
                    UserInfo.UserPassword = {};
                    UserInfo.UserPassword.CryptType = data.Password_CryptType;
                    UserInfo.UserPassword.CryptVal = data.Password_CryptValue;
                    UserInfo.Role = data.Role;

                    result.FILoginAcctInfoListInqRqHeader.SignonRq.UserInfo = UserInfo;
                    result.FILoginAcctInfoListInqRqHeader.FILoginAcctInfoListInqRq.IncludeDetail = "FIAcctSummary"
                   

                    var postdata = toXML.buildObject(result);
                    var options = {
                        method: 'POST',
                        uri: jsonData.item[8].request.url.raw,
                        headers:
                        {'content-type':'application/xml'},
                        body: postdata
                    };
                    callback("true", null , options);
                }
            })
        }else if(valid == "false")
            return callback("false",err,null)
        else
            callback("error",err,null)
    })
};
exports.CreateVUser = function(NewUser,callback){

    DBFunctions.GetVendorAdminInfo(NewUser.SessionID,function(valid,err,AdminInfo){
       
        if(valid == "false"){
            return callback("false",err,null)
       
        }else{
            toJSON.parseString(jsonData.item[0].request.body.raw,function(err,result){
                if(err){
                    return callback("false",err,null);
                  
                }
                else{
                  
                    var UAInfo={};
                    UAInfo.UserID = AdminInfo.User_Id;
                    UAInfo.HomeID = AdminInfo.Home_Id;
                    var UAPassword = {};
                    UAPassword.CryptType = AdminInfo.Password_CryptType;
                    UAPassword.CryptVal = AdminInfo.Password_CryptValue;
                    UAInfo.UserPassword = UAPassword;

                 
                    var UInfo = {};
                    UInfo.UserID = NewUser.UserInfo.UserID;
                    UInfo.HomeID = AdminInfo.Home_Id;
                    var UPassword = {};
                    UPassword.CryptType= NewUser.UserInfo.UserPassword.CryptType;
                    UPassword.CryptVal= NewUser.UserInfo.UserPassword.CryptVal;
                    UInfo.UserPassword = UPassword;

                    UAInfo.Role = AdminInfo.Role;
                    NewUser.NewUserRq.UserInfo = UInfo;
                  

                    var UserInfoProfile = {};
                    UserInfoProfile.HomeID = AdminInfo.Home_Id;
                    UserInfoProfile.UserID = NewUser.UserInfo.UserID;
                    var PInfo = NewUser.NewUserRq.UserProfile.PersonInfo;
                    UserInfoProfile.PersonInfo = PInfo;


                    
                    result.UserAddRqHeader.SignonRq.UserInfo = UAInfo;
                    result.UserAddRqHeader.UserAddRq.UserInfo = UInfo;
                    result.UserAddRqHeader.UserAddRq.UserProfile = UserInfoProfile;
                    result.UserAddRqHeader.RqUID = "WSTst createUser with Opt element";

                    var postData = toXML.buildObject(result);

                    var options = {
                        method: 'POST',
                        uri: jsonData.item[0].request.url.raw,
                        headers:
                        {'content-type':'application/xml'},
                        body: postData
                    }
                    
                    callback("true",null,options);
                }
            })
        }
    })

  
};
exports.CreateAccount = function(HarvestAddID, RunID,sessionID,callback){
    DBFunctions.GetNewAccRawData(sessionID,function(valid,err,resdata){
        if(valid == "false"){
            return callback("false",err,null)
        }else if (valid == "true"){
            DBFunctions.GetUserData(sessionID,function(valid,err,userData){
                if(valid == "false"){
                    return callback("false",err,null)
                }
                else if (valid == "true"){
                    var UserInfo = {};
                    UserInfo.UserID = userData.User_Id;
                    UserInfo.HomeID = userData.Home_Id;
                    UserInfo.UserPassword = {};
                    UserInfo.UserPassword.CryptType = userData.Password_CryptType;
                    UserInfo.UserPassword.CryptVal = userData.Password_CryptValue;
                    UserInfo.Role = userData.Role;

                    toJSON.parseString(jsonData.item[5].request.body.raw,function(err,result){
                        if(err){
                            return callback("false",err,null);
                        }else{
                            result.HarvestAddCreateAcctsRqHeader.SignonRq.UserInfo = UserInfo;
                            result.HarvestAddCreateAcctsRqHeader.HarvestAddCreateAcctsRq.RunId = RunID;
                            result.HarvestAddCreateAcctsRqHeader.HarvestAddCreateAcctsRq.HarvestAddID = HarvestAddID;
                            result.HarvestAddCreateAcctsRqHeader.HarvestAddCreateAcctsRq.HarvestAddFetchAcctList = resdata.HarvestAddFetchRsHeader.HarvestAddFetchRs.HarvestAddFetchAcctList;
                            console.log(result);
                            var postdata = toXML.buildObject(result);

                            var options = {
                                method: 'POST',
                                uri: jsonData.item[5].request.url.raw,
                                headers:
                                {'content-type':'application/xml'},
                                body: postdata
                            }
                            callback("true",null,options);
                        }
                    })
                }
                else
                    return callback("error",err)

            })
        }else
            return callback("error",err)
       
    })

};
exports.GetAccountStatus = function(HarvestID,RunID,sessionID,callback){
    DBFunctions.GetUserData(sessionID,function(valid,err,data){
        if(valid == "true"){
            toJSON.parseString(jsonData.item[3].request.body.raw,function(err,result){
                if(err)
                    return callback("false",err,null)
                else{
                    var UserInfo = {};
                    UserInfo.UserID = data.User_Id;
                    UserInfo.HomeID = data.Home_Id;
                    UserInfo.UserPassword = {};
                    UserInfo.UserPassword.CryptType = data.Password_CryptType;
                    UserInfo.UserPassword.CryptVal = data.Password_CryptValue;
                    UserInfo.Role = data.Role;

                    result.HarvestAddStsInqRqHeader.SignonRq.UserInfo = UserInfo;
                    result.HarvestAddStsInqRqHeader.HarvestAddStsInqRq.RunId = RunID;
                    result.HarvestAddStsInqRqHeader.HarvestAddStsInqRq.HarvestAddID = HarvestID;

                    var postdata = toXML.buildObject(result);
                    var options = {
                        method: 'POST',
                        uri: jsonData.item[3].request.url.raw,
                        headers:
                        {'content-type':'application/xml'},
                        body: postdata
                    };
                    callback("true", null , options);
                }
            })
        }else if(valid == "false")
            return callback("false",err,null)
        else
            callback("error",err,null)
    })
};

exports.GetNewAccount = function(HarvestID,RunID,sessionID,callback){
    DBFunctions.GetUserData(sessionID,function(valid,err,data){
        if(valid == "true"){
            var UserInfo = {};
            UserInfo.UserID = data.User_Id;
            UserInfo.HomeID = data.Home_Id;
            UserInfo.UserPassword = {};
            UserInfo.UserPassword.CryptType = data.Password_CryptType;
            UserInfo.UserPassword.CryptVal = data.Password_CryptValue;
            UserInfo.Role = data.Role;

            toJSON.parseString(jsonData.item[4].request.body.raw, function(err,result){
                if(err){
                    return callback("false",err,null);
                }else{
                
                   
                    result.HarvestAddFetchRqHeader.SignonRq.UserInfo = UserInfo;
                    result.HarvestAddFetchRqHeader.HarvestAddFetchRq.RunId = RunID;
                    result.HarvestAddFetchRqHeader.HarvestAddFetchRq.HarvestAddID = HarvestID;
                   
                    var postdata = toXML.buildObject(result);
                    console.log(postdata);
                    var options = {
                        method: 'POST',
                        uri: jsonData.item[4].request.url.raw,
                        headers:
                        {'content-type':'application/xml'},
                        body: postdata
                    };
                    
                    callback("true", null , options);
                }
            })
        }else if(valid == "false")
            return callback("false",err,null)
        else
           callback("error",err,null)
    })
};

exports.InitiateAddAcc = function(sessionID,ParamInfo,callback){
    DBFunctions.GetUserData(sessionID,function(valid,err,data){
        if(valid == "true"){
            var UserInfo = {};
            UserInfo.UserID = data.User_Id;
            UserInfo.HomeID = data.Home_Id;
            UserInfo.UserPassword = {};
            UserInfo.UserPassword.CryptType = data.Password_CryptType;
            UserInfo.UserPassword.CryptVal = data.Password_CryptValue;
            UserInfo.Role = data.Role;

            toJSON.parseString(jsonData.item[2].request.body.raw, function(err,result){
                if(err){
                    return callback("false",err,null);
                }else{
                    
                   
                    var AddNewAccounts = {};
                    AddNewAccounts.FIId = ParamInfo.FIId;
                    AddNewAccounts.TrustMode = ParamInfo.TrustMode;
                    AddNewAccounts.UserID = UserInfo.UserID;
                    AddNewAccounts.UserPassword = UserInfo.UserPassword;
                  
                    AddNewAccounts.FILoginParamList = {};
                    AddNewAccounts.FILoginParamList.FILoginParam = [];
                   
                    for(var loginParam of ParamInfo.ParamList.Params){
                       
                        AddNewAccounts.FILoginParamList.FILoginParam.push(loginParam)
                    }
                    
                    delete result.HarvestAddRqHeader.SignonRq.UserInfo;
                    delete result.HarvestAddRqHeader.HarvestAddRq.AddNewAccts;

                    result.HarvestAddRqHeader.SignonRq.UserInfo = UserInfo;
                    result.HarvestAddRqHeader.HarvestAddRq.AddNewAccts = AddNewAccounts;
                    
                    var postdata = toXML.buildObject(result);
                    console.log(postdata);
                    var options = {
                        method: 'POST',
                        uri: jsonData.item[2].request.url.raw,
                        headers:
                        {'content-type':'application/xml'},
                        body: postdata
                    };
                    
                    callback("true", null , options);
                }
            })
        }else if(valid == "false")
            return callback("false",err,null)
        else
           callback("error",err,null)
    })
};



exports.FIAddReq = function(FIParams){
    var convertedData = JSON.parse(parser.toJson(jsonData.item[2].request.body.raw, {reversible : true}));
    var reqData = getData.AddFI(FIParams.UserID);
    
    
    convertedData.HarvestAddRqHeader.RqUID.$t = "RqUID0";
    convertedData.HarvestAddRqHeader.SignonRq.UserInfo.UserID.$t = reqData.UserID;
    convertedData.HarvestAddRqHeader.SignonRq.UserInfo.HomeID.$t = reqData.HomeID;
    convertedData.HarvestAddRqHeader.SignonRq.UserInfo.UserPassword.CryptType.$t = reqData.UserPassword.CryptType;
    convertedData.HarvestAddRqHeader.SignonRq.UserInfo.UserPassword.CryptVal.$t = reqData.UserPassword.CryptVal;
    convertedData.HarvestAddRqHeader.HarvestAddRq.AddNewAccts.FIId.$t = reqData.FIId;
    convertedData.HarvestAddRqHeader.HarvestAddRq.AddNewAccts.TrustMode.$t = reqData.TrustMode;
    convertedData.HarvestAddRqHeader.HarvestAddRq.AddNewAccts.UserID.$t = reqData.UserID;
    convertedData.HarvestAddRqHeader.HarvestAddRq.AddNewAccts.UserPassword.CryptType.$t = reqData.UserPassword.CryptType;
    convertedData.HarvestAddRqHeader.HarvestAddRq.AddNewAccts.UserPassword.CryptVal.$t = reqData.UserPassword.CryptVal;
    
    
    delete convertedData.HarvestAddRqHeader.HarvestAddRq.AddNewAccts.FILoginParamList.FILoginParam;
   
    var size = FIParams.FIParamList.length;
    
  
    for(var x = 0; x < size ; x++){
       
        var tempData = FIParams.FIParamList;
      
        
        FIParams.FIParamList[x].ParamName = {$t : tempData[x].ParamName};
        FIParams.FIParamList[x].CryptParamVal.CryptType = {$t : tempData[x].CryptParamVal.CryptType};
        FIParams.FIParamList[x].CryptParamVal.CryptVal = {$t : tempData[x].CryptParamVal.CryptVal};
    }
    
    convertedData.HarvestAddRqHeader.HarvestAddRq.AddNewAccts.FILoginParamList.FILoginParam = FIParams.FIParamList;

    
    
    return parser.toXml(convertedData);
};

