var exports = module.exports;
var mysql = require("mysql");
var util = require('util');

const GlobalHomeID = "88886648";

var conUserData = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "password0",
    database : "userdata",
    multipleStatements : true
});


function GetUserCredInfo(sessionID,callback){
    var sql = 'select * from user_creds where SessionID = ?';
    conUserData.query(sql,[sessionID],function(err,result,fields){
        if(err){
            return callback("false",err,null);
        }
        else if(result.length == 0)
            return callback("false", "sessionID does not match a user in db",null);
        else
            callback("true",null,result);
       
    })
}





exports.ValidateUserCred = function(Credentials,callback){
    var sql = "update user_creds set SessionID = ? where Username = ? and Password = ?";
    conUserData.query(sql,[Credentials.sessionID,Credentials.user, Credentials.pass],function(err,result){
        if(err)
            return callback("error","error with updating sessionID")
        else if(result.affectedRows == 1)
            callback("true",null)
        else
            return callback("error", "sessionID update was unsuccessful; user does not exist")
    })   
       
};

exports.ReleaseHarvestID = function(){
    return "error";
};

exports.UpdateUserInfo = function(newData, callback){
    var sql = "select * from user_creds where SessionID = ?";
    conUserData.query(sql,[newData.sessionID],function(err,result,fields){
        
   
    })
};


exports.GetNewAccRawData =function(sessionID,callback){
    var sql = `select mappingdata.newacc_rawdata.RawData from 
                ((((user_creds inner join mappingdata.user_info on user_creds.UC_Id = mappingdata.user_info.UC_ID_fk 
                    and SessionID = ?)
                inner join mappingdata.fi_info on mappingdata.fi_info.UserInfo_Id = mappingdata.user_info.UserInfo_Id)
                inner join mappingdata.fi_accountlogin_info on mappingdata.fi_accountlogin_info.FIInfo_Id = mappingdata.fi_info.FIInfo_Id)
                inner join mappingdata.newacc_rawdata on mappingdata.newacc_rawdata.FILoginInfo_Id = mappingdata.fi_accountlogin_info.FILoginInfo_Id)            
    `
    conUserData.query(sql,[sessionID],function(err,result,fields){
        if(err)
            return callback("error",err,null)
        else if (result.length == 0)
            return callback("false","query yielded 0 results",null);
        else{
            var resdata = JSON.parse(result[0].RawData);
            callback("true",null,resdata);
        }
    })
};

exports.GetUserData=function(sessionID,callback){
    var sql = `select mappingdata.user_info.User_Id,mappingdata.user_info.Home_Id,mappingdata.user_info.Password_CryptType,
                mappingdata.user_info.Password_CryptValue,mappingdata.user_info.Role 
                from user_creds
                inner join mappingdata.user_info on user_creds.UC_Id = mappingdata.user_info.UC_ID_fk 
                    and user_creds.SessionID = ?`;
    conUserData.query(sql,[sessionID],function(err,result,fields){
        if(err)
            return callback("error",err,null);
        else if(result.length == 0)
            return callback("false","sessionID does not match a user",null);
        else{
            callback("true",null,result[0]);     
        }
      
    });
};

exports.GetVendorUserData = function(sessionID, callback){
    var sql=`select mappingdata.user_info.User_Id, mappingdata.user_info.Password_CryptValue,mappingdata.contact_info.First_Name,
            mappingdata.contact_info.Last_Name,mappingdata.contact_info.Middle_Name,mappingdata.contact_info.Person_Type,
            mappingdata.contact_info.Phone_Num,mappingdata.contact_info.Phone_Type,mappingdata.contact_info.Email_Address,
            mappingdata.contact_info.Address_Location,mappingdata.contact_info.Address_Suite,mappingdata.contact_info.State,
            mappingdata.contact_info.City,mappingdata.contact_info.Postal_Code,mappingdata.contact_info.Country
            from ((user_creds 
            inner join mappingdata.user_info on user_creds.UC_Id = mappingdata.user_info.UC_ID_fk
                and SessionID = ?)
            inner join mappingdata.contact_info on mappingdata.contact_info.UserInfo_Id = mappingdata.user_info.UserInfo_Id);`;
    conUserData.query(sql,[sessionID],function(error,result,field){
        if(error)
            return callback("false",error,null);
        else if(result.length == 0)
            return callback("false","sessionID does not match a user",null);
        else{
            callback("true", null, result[0]);
        }
    })
};

exports.GetFIReqData = function(){
    return "error";
};

exports.GetHarvestAddID = function(sessionID,callback){
    var sql = `select mappingdata.fi_info.HarvestAdd_Id,mappingdata.fi_info.Run_Id from
                ((user_creds inner join mappingdata.user_info on user_creds.UC_Id = mappingdata.user_info.UC_ID_fk and SessionID = ?)
                inner join mappingdata.fi_info on mappingdata.fi_info.UserInfo_Id = mappingdata.user_info.UserInfo_Id)`;
    conUserData.query(sql,[sessionID],function(err,result,fields){
        if(err)
            return callback("error", err,null,null)
        else if(result.length == 0 )
            return callback("false", "query returned 0 results", null,null);
        else
            callback("true",null,result[0].HarvestAdd_Id,result[0].Run_Id);
    })
};



exports.GetFI = function(sessionID, callback){
    var sql = `
    select  mappingdata.fi_info.FI_Id,mappingdata.fi_info.FI_Name,mappingdata.fi_info.Country,
            mappingdata.fi_info.FI_Harvest_Status,mappingdata.fi_info.FI_Crawlable,mappingdata.fi_info.Param_Name,
            mappingdata.fi_info.Param_Value,mappingdata.fi_info.IsMFA
            from ((user_creds
            inner join mappingdata.user_info on user_creds.UC_Id = mappingdata.user_info.UC_ID_fk
                and SessionID = ?)
            inner join mappingdata.fi_info on mappingdata.user_info.UserInfo_Id = mappingdata.fi_info.UserInfo_Id);
    
    select  mappingdata.fiaccount_data.AcctType_Id,mappingdata.fiaccount_data.Acct_Group,mappingdata.fiaccount_data.Acct_Name,
            mappingdata.fiaccount_data.Acct_Type,mappingdata.fiaccount_data.ExtAcct_Type
            from(((user_creds
            inner join mappingdata.user_info on user_creds.UC_Id = mappingdata.user_info.UC_ID_fk
                and SessionID = ?)
            inner join mappingdata.fi_info on mappingdata.fi_info.UserInfo_Id = mappingdata.user_info.UserInfo_Id)
            inner join mappingdata.fiaccount_data on mappingdata.fiaccount_data.FIInfo_Id = mappingdata.fi_info.FIInfo_Id);
            
    select  mappingdata.filogin_params.Param_Id, mappingdata.filogin_params.Param_Num,mappingdata.filogin_params.Param_Type,
            mappingdata.filogin_params.Param_MaxLength,mappingdata.filogin_params.Param_Size,mappingdata.filogin_params.Param_Caption,
            mappingdata.filogin_params.Param_VariableName,mappingdata.filogin_params.Param_DefaultValue,mappingdata.filogin_params.Param_Editable,mappingdata.filogin_params.Param_SensCode
            from(((user_creds
            inner join mappingdata.user_info on user_creds.UC_Id = mappingdata.user_info.UC_ID_fk
                and SessionID = ?)
            inner join mappingdata.fi_info on mappingdata.fi_info.UserInfo_Id = mappingdata.user_info.UserInfo_Id)
            inner join mappingdata.filogin_params on mappingdata.filogin_params.FIInfo_Id = mappingdata.fi_info.FIInfo_Id);
            `
    conUserData.query(sql,[sessionID,sessionID,sessionID],function(err,result,fields){
        var FIData = {};
        if(err)
            return callback("error",err, null)
        else if(result[0].length == 0 || result[1].length == 0 || result[2].length == 0)
            return callback("false", "query failed; empty results for some queries", null)
        else{
            FIData.FIInfoData = result[0][0];
            FIData.FIAcctDataList = result[1];
            FIData.FILoginParametersInfo = result[2];
            callback("true",null,FIData);
        }
    })

    return "error";
};

exports.GetAccountStatus = function(){
    return "error";
};

exports.GetNewAccount = function(){
    return "error";
};

exports.GetVendorUserInfo = function(){
    return "error";
};

exports.GetVendorAdminInfo = function(sessionID,callback){
   
    var sql = `select mappingdata.user_info.User_Id, mappingdata.user_info.Home_Id,mappingdata.user_info.Password_CryptType, 
                mappingdata.user_info.Password_CryptValue, mappingdata.user_info.Role
                from mappingdata.user_info where Role = ? `;

    conUserData.query(sql,['Admin'],function(err,result,fields){
        if(err){
            return callback("false",err,null);
  
        }
        else if(result.length == 0)
            return callback("false","admin info does not exist or err with query",null);
        else{
            callback("true",null,result[0]);
        }
      
    })
};
 

exports.GetAccSum = function(){
    return "error";
};

exports.GetAccTrans = function(){
    return "error";
};

exports.GetAccDetails = function(){
    return "error";
};

exports.GetAccDetInfo = function(sessionID,callback){
    GetUserData(sessionID,function(valid,err,data){
        if(valid == "true")
        {
            var sql = `select FILoginAcct_Id from
                        ((mappingdata.user_info inner join mappingdata.fi_info on mappingdata.user_info.UserInfo_Id = mappingdata.fi_info.UserInfo_Id
                                and mappingdata.user_info.User_Id = ?)
                        inner join mappingdata.fi_accountlogin_info on mappingdata.fi_accountlogin_info.FIInfo_Id = mappingdata.fi_info.FIInfo_Id)`;
            conUserData.query(sql,[data.User_Id],function(err,result,fields){
                if(err)
                    return callback("false",err,null)
                else if(result.length == 0)
                    return callback("false","query returned 0 results", null)
                else{
                    data.FILoginAcctID = result[0].FILoginAcct_Id;
                    callback("true",null,data);
                }
            })
        }
        else
            return callback("false",err);
    })
};

exports.GetAccTransInfo = function(){
    return "error";
};

exports.GetAccSumInfo = function(sID){
    GetUserData(sID,function(valid,err,data){
        var sql = `select `
    })
};
exports.GetFIID = function(){
    var sql = ``
    throw "getFIID not ready for use"
}

exports.StoreNewFILoginInfo = function(ResData,sessionID,callback){
    var sql = `update  mappingdata.fiuser_loginacctinfo set Classified_Status = ? where FILoginInfo_Id =
        (select FILoginInfo_Id from mappingdata.fi_accountlogin_info where FILoginAcct_Id = ?);
    
        select FIULAI_Id from 
        (mappingdata.fi_accountlogin_info inner join mappingdata.fiuser_loginacctinfo 
            on mappingdata.fi_accountlogin_info.FILoginInfo_Id = mappingdata.fiuser_loginacctinfo.FILoginInfo_Id
                and mappingdata.fi_accountlogin_info.FILoginAcct_Id = ?);
        `;
    
        conUserData.beginTransaction(function(err){
            if(err){
                callback(false,err);
                throw err;
            }
            conUserData.query(sql,[ResData.HarvestAddCreateAcctsRsHeader.HarvestAddCreateAcctsRs.FIUserLoginAcctInfo.ClassifiedStatus,
                            ResData.HarvestAddCreateAcctsRsHeader.HarvestAddCreateAcctsRs.FILoginAcctId,
                            ResData.HarvestAddCreateAcctsRsHeader.HarvestAddCreateAcctsRs.FILoginAcctId],function(err,results,field){
                if(err){
                    return conUserData.rollback(function(){
                        callback(false,err);
                        throw err;
                    })
                }else if(results[0].affectedRows ==1 && results[1].length == 1){
    
                    var urls = ResData.HarvestAddCreateAcctsRsHeader.HarvestAddCreateAcctsRs.FIUserLoginAcctInfo.URL;
                    var URLinsertdata = [];
                    for(var url of urls){
                        var temparr = [];
                        temparr.push(url.ParamName,url.ParamVal,results[1][0].FIULAI_Id);
                        
                        URLinsertdata.push(temparr);
                    }
                    sql = `insert into mappingdata.fi_accountlogin_urls(URL_Name,URL_Value,FIULAI_Id)
                    values ?;`
    
                    conUserData.query(sql,[URLinsertdata],function(err,result1){
                        if(err){
                            return conUserData.rollback(function(){
                                callback(false,err);
                                throw err;
                            })
                        }else if (result1.affectedRows == URLinsertdata.length ){
                            var FIAList = ResData.HarvestAddCreateAcctsRsHeader.HarvestAddCreateAcctsRs.FIAcctIdentifierList.FIAcctIdentifier;
                            var CEID = ResData.HarvestAddCreateAcctsRsHeader.SignonRs.CEUserID;
        
                            for(var FIAId of FIAList){
                                var AcctID = FIAId.FIAcctId.AcctId,
                                    AcctNum = FIAId.HarvestAddFetchAcct.AcctNumber,
                                    Name = FIAId.HarvestAddFetchAcct.FIAcctName.ParamName,
                                    Value = FIAId.HarvestAddFetchAcct.FIAcctName.ParamVal
                                sql = `
                                update mappingdata.fi_account set FIA_Id = ? where Account_Num = ? 
                                    and Account_Name = ? 
                                    and Account_Value = ?
                                    and CEUser_Id = ?`;
                                conUserData.query(sql,[AcctID,AcctNum,Name,Value,CEID],function(err,result){
                                    if(err){
                                        return conUserData.rollback(function(){
                                            callback(false,err);
                                            throw err;
                                        })
                                    }else if (result.affectedRows == 1 ){
                                        return;
                                    }
                                    else{
                                        conUserData.rollback(function(){
                                            callback(false,"bad inner query;")
                                            throw "bad inner inner query"
                                        })
                                    }
                                })
                            }
                            return conUserData.commit(function(err){
                                if(err)
                                    return conUserData.rollback(function(){
                                        callback(false,err);
                                        throw err;
                                    })
                                callback(true,null);
                            })
                        }
                        else{
                            conUserData.rollback(function(){
                                callback(false,"bad inner query;")
                                throw "bad inner query"
                            })
                        }
                    
                       
                    })
                }else{
                    conUserData.rollback(function(){
                        callback(false,"bad outer query;")
                        throw "bad outer query"
                    })
                }
            })
        })
}
exports.StoreAccData = function(ResData, sessionID,callback){
    var sql = `select mappingdata.fi_accountlogin_info.FILoginInfo_Id from
        (((user_creds inner join mappingdata.user_info on user_creds.UC_Id = mappingdata.user_info.UC_ID_fk 
                and SessionID = ?)
            inner join mappingdata.fi_info on mappingdata.fi_info.UserInfo_Id = mappingdata.user_info.UserInfo_Id)
            inner join mappingdata.fi_accountlogin_info on mappingdata.fi_accountlogin_info.FIInfo_Id = mappingdata.fi_info.FIInfo_Id);
            `;
        
        conUserData.beginTransaction(function(err){
            if(err)
                return conUserData.rollback(function(){
                    callback(false,err)
                    throw err
                })
            var AccList = ResData.HarvestAddFetchRsHeader.HarvestAddFetchRs.HarvestAddFetchAcctList.HarvestAddFetchAcct;
            var CEUserId = ResData.HarvestAddFetchRsHeader.SignonRs.CEUserID;
            
                conUserData.query(sql,[sessionID,JSON.stringify(ResData)],function(err,result1,fields){
                    if(err)
                        return conUserData.rollback(function(){
                            callback(false,err);
                            throw err;
                        })
                    else if(result1.length == 0){
                        return conUserData.rollback(function(){
                            callback(false,"query yielded no results")
                            throw ("query yielded no results!(1st level)")
                        })
                    }
                    else{
                        var x = 0;
                        
                        sql = 'insert into mappingdata.newacc_rawdata (RawData,FILoginInfo_Id) values (?,?);';
                        conUserData.query(sql,[JSON.stringify(ResData),result1[0].FILoginInfo_Id],function(err,result){
                            if(err)
                                return conUserData.rollback(function(){
                                    callback(false,err)
                                    throw err
                                })
                            else if(result.affectedRows ==1)
                                return
                            else
                                return conUserData.rollback(function(){
                                    callback(false,"query return wrong amount of affectedrows")
                                    throw "bad query"
                                })
                        })
                        
                        for( var account of AccList){
                            
                            if(JSON.stringify(account.Misc) == "{}")
                                account.Misc = '';
                            sql = `
                            insert into mappingdata.fi_account(FI_Id,Account_Num,Account_Name,Account_Value,AccountType_Id,CurCode,Misc,FILoginInfo_Id,CEUser_Id)
                            values (?,?,?,?,?,?,?,?,?);`
                           
                            conUserData.query(sql,[account.FIId,account.AcctNumber,account.FIAcctName.ParamName,account.FIAcctName.ParamVal,
                                                    account.AcctTypeId,account.CurCode,account.Misc,result1[0].FILoginInfo_Id,CEUserId],
                                                    function(err,result){
                                                        
                                if(err)
                                    return conUserData.rollback(function(){
                                        callback(false,err)
                                        throw err
                                    })
                                else if(result.affectedRows == 1){
                                    
                                    var insertArr = [];
                                    for(var y = 0; y < account.AcctBal.length;++y){
                                        var tempArr = [];
                                        tempArr.push(AccList[x].AcctBal[y].BalType,AccList[x].AcctBal[y].CurAmt.Amt,AccList[x].AcctBal[y].CurAmt.CurCode,result.insertId)
                                        insertArr.push(tempArr);
                                    }
                                    
                                    ++x;
                                        
                                    
                                    sql = `insert into mappingdata.fi_account_balance(AcctBalance_Type,Current_Amount,Currency_Code,FIAccount_Id)  
                                            values ?`
                                    conUserData.query(sql,[insertArr],function(err,result){
                                        if(err)
                                            return conUserData.rollback(function(){
                                                callback(false,err)
                                                throw err
                                            })
                                        else if(result.affectedRows == account.AcctBal.length)
                                            return;
                                        else
                                            return conUserData.rollback(function(){
                                                callback(false,"query failed to insert!")
                                                throw ("query yielded no results(3rd level)");
                                            })                                            
                                    })
                                }
                                else
                                    return conUserData.rollback(function(){
                                        callback(false,"query yielded no results!")
                                        throw ("query yielded no results(2nd level)")
                                    })
                            })
                        }
                        return conUserData.commit(function(err){
                            if(err)return conUserData.rollback(function(){
                                callback(false,err)
                                throw err
                            })
                            callback(true,null)
                        })
                    }
                })
    
            
            
        })
}

exports.StoreAccSum = function(){
    return "error";
};

exports.StoreAccTrans = function(){
    return "error";
};

exports.StoreAccDetails = function(){
    return "error";
};

exports.StoreHarvestID = function(HarvestID,sessionID,callback){
    var sql = `update mappingdata.fi_accountlogin_info 
                set HarvestID = ?
                where (select mappingdata.fi_accountlogin_info.FIInfo_Id from
                        ((user_creds inner join mappingdata.user_info on user_creds.UC_Id = mappingdata.user_info.UC_ID_fk 
                            and SessionID = ?)
                        inner join mappingdata.fi_info on mappingdata.fi_info.UserInfo_Id = mappingdata.user_info.UserInfo_Id)
                        inner join (select * from mappingdata.fi_accountlogin_info)as x where x.FIInfo_Id = mappingdata.fi_info.FIInfo_Id)`
    conUserData.query(sql,[HarvestID,sessionID],function(err,result){
        if(err){
            callback(false,err)
            throw err
        }
        else if(result.affectedRows == 1)
            callback(true,null);
        else{
            callback(false,"db could not add HarvestID")
            throw err;
        }
    })
};


exports.StoreFI = function(vendorRes,sessionID,callback){
    console.log("inside storeFI in dbfunction!");

    var sql = ` insert into mappingdata.fi_info(UserInfo_Id,FI_Id,FI_Name,Country,FI_Harvest_Status,FI_Crawlable,Param_Name,Param_Value,IsMFA)
                values((select mappingdata.user_info.UserInfo_Id from mappingdata.user_info 
                        inner join user_creds on user_creds.UC_Id = mappingdata.user_info.UC_ID_fk 
                            and SessionID = ?), ?,?,?,?,?,?,?,?)`;
  
    var FIInfo= vendorRes.FIInfoRsHeader.FIInfoRs.FIInfoDataList.FIInfoData.FIInfo;
   
    var FIAccList = vendorRes.FIInfoRsHeader.FIInfoRs.FIInfoDataList.FIInfoData.FIAcctDataList.FIAcctData;
    
    var FIParamsList = vendorRes.FIInfoRsHeader.FIInfoRs.FIInfoDataList.FIInfoData.FILoginParametersInfoList.FILoginParametersInfo;

    
    var query = `(select mappingdata.fi_info.FIInfo_Id from
        ((user_creds 
        inner join mappingdata.user_info on user_creds.UC_Id = mappingdata.user_info.UC_ID_fk 
            and SessionID = ${sessionID})
        inner join mappingdata.fi_info on mappingdata.fi_info.UserInfo_Id = mappingdata.user_info.UserInfo_Id)`;


    conUserData.beginTransaction(function(err){
        
        if(err) throw err;
    
        conUserData.query(sql,[sessionID,FIInfo.FIId,FIInfo.FIName,FIInfo.Country,FIInfo.FIHarvestStatus,FIInfo.FICrawlable,
            FIInfo.URL.ParamName,FIInfo.URL.ParamVal,FIInfo.IsMFA],function(err,result){
            if(err){
                return conUserData.rollback(function(){
                    callback(false, err)
                    throw err;
                })
            }
            else if (result.affectedRows == 1){

                sql =`  insert into mappingdata.fiaccount_data(AcctType_Id,Acct_Group,Acct_Name,Acct_Type,ExtAcct_Type,FI_Id,FIInfo_Id)
                            values ?;       

                        insert into mappingdata.filogin_params(FI_Id,Param_Id,Param_Num,Param_Type,Param_MaxLength,Param_Size,
                        Param_Caption,Param_VariableName,Param_DefaultValue,Param_Editable,Param_SensCode,FIInfo_Id)
                            values ?;    `;

                var FIListRawData = [];  
                var FIParamListRawData = [];
                for(var FIAcct of FIAccList){
                
                    var tempArr = [];
                    tempArr.push(FIAcct.AcctTypeId,FIAcct.AcctGroup,FIAcct.AcctName,FIAcct.AcctType,FIAcct.ExtAcctType,FIInfo.FIId,result.insertId);
                    FIListRawData.push(tempArr);
                }
           
                for(var FIParam of FIParamsList){
               
                    var tempArr = [];
                    tempArr.push(FIInfo.FIId,FIParam.ParameterId,FIParam.ParameterNumber,FIParam.ParameterType,FIParam.ParameterMaxLength,
                        FIParam.ParameterSize,FIParam.ParameterCaption,FIParam.ParameterVariableName);

                    if(JSON.stringify(FIParam.ParameterDefaultValue)=="{}")
                        tempArr.push(null,FIParam.ParameterEditable,FIParam.ParameterSensitivityCode,result.insertId);
                    else
                        tempArr.push(FIParam.ParameterDefaultValue,FIParam.ParameterEditable,FIParam.ParameterSensitivityCode,result.insertId);
                        
                    FIParamListRawData.push(tempArr);
                }
                
                conUserData.query(sql,[FIListRawData,FIParamListRawData],function(err,result){
               
                        if(err){
                            return conUserData.rollback(function(){
                                callback(false, err)
                                throw err;
                            })
                        }
                        else if (result[0].affectedRows == FIListRawData.length && result[1].affectedRows == FIParamListRawData.length)
                        {
                            return conUserData.commit(function(err){
                                if(err)
                                    return conUserData.rollback(function(){
                                        callback(false,err);
                                        throw err;
                                    })
                                callback(true,null);
                            })
                        }
                        else
                        {
                            return conUserData.rollback(function(){
                                callback(false,"insertion failed; records not added (inner query)");
                                throw err;
                            })
                        }
                })
            }else{
                return conUserData.rollback(function(){
                    callback(false,"insertion failed; records not added(outer query)");
                    throw err;
                })
            }
        })
    })
    
};


exports.StoreUser = function(userInfo,callback){
    var sql = "select * from user_creds where Username = ?";
    conUserData.query(sql,[userInfo.user], function(err,result,fields){
        if(err)
            return callback("error","Error Running DB query");
        else if(result.length == 0){
            sql = `insert into user_creds (Username,Password,SessionID)
            values(?,?,?)`;

            conUserData.query(sql,[userInfo.user,userInfo.pass,userInfo.sessionID],function(err,result){
                if(err)
                    return callback("error","Error Inserting User into DB");
                else if(result.affectedRows == "1")
                    callback("true",null);
            });
            
        }else{
            return callback("false","User already exists in the database");
        }
    });
    
};

//COMPLETE
exports.StoreFIHarvestData = function(ParamInfo,HarvestRes,callback){
    var sql = `

    update mappingdata.fi_info
    set Run_Id = ?,HarvestAdd_Id = ?
    where UserInfo_Id = (
        select mappingdata.fi_info.UserInfo_Id from 
            ((user_creds inner join mappingdata.user_info on user_creds.UC_Id = mappingdata.user_info.UC_ID_fk and SessionID = ?)
            inner join (select * from mappingdata.fi_info) as x on x.UserInfo_Id = mappingdata.user_info.UserInfo_Id)
                        );

    insert into mappingdata.fi_accountlogin_info (FILoginAcct_Id,FIInfo_Id) values (?,
        (
            select mappingdata.fi_info.FIInfo_Id from
            ((user_creds inner join mappingdata.user_info on user_creds.UC_Id = mappingdata.user_info.UC_ID_fk and SessionID = ?)
            inner join mappingdata.fi_info on mappingdata.fi_info.UserInfo_Id = mappingdata.user_info.UserInfo_Id)
        )
        );
    `;
    conUserData.beginTransaction(function(err){
        if(err){
            callback(false,err);
            throw err;
        }
        conUserData.query(sql,[HarvestRes.RunId,HarvestRes.HarvestAddID,ParamInfo.sessionID,HarvestRes.FILoginAcctId,ParamInfo.sessionID],function(err,result,field){
            if(err){
                return conUserData.rollback(function(){
                    callback(false,err);
                    throw err;
                })
            }else if(result[0].affectedRows ==1 && result[1].affectedRows ==1){
                sql = `insert into mappingdata.fiuser_loginacctinfo (AcctHarvest_Status,Classified_Status,Trust_Mode,FILoginInfo_Id)
                values(?,?,?,?)`;
                conUserData.query(sql,[HarvestRes.FIUserLoginAcctInfo.AcctHarvestStatus,HarvestRes.FIUserLoginAcctInfo.ClassifiedStatus,
                                        HarvestRes.FIUserLoginAcctInfo.TrustMode, result[1].insertId],function(err,result){
                    if(err){
                        return conUserData.rollback(function(){
                            callback(false,err);
                            throw err;
                        })
                    }else if (result.affectedRows == 1 ){
                        return conUserData.commit(function(err){
                            if(err)
                                return conUserData.rollback(function(){
                                    callback(false,err);
                                    throw err;
                                })
                            callback(true,null);
                        })
                    }
                    else{
                        conUserData.rollback(function(){
                            callback(false,"bad inner query;")
                            throw err
                        })
                    }
                })
            }else{
                conUserData.rollback(function(){
                    callback(false,"bad outer query;")
                    throw err
                })
            }
        })
    })
};


//COMPLETE
exports.StoreVendorUser = function(NewUserReq,VendorRes,callback){

    GetUserCredInfo(NewUserReq.SessionID,function(successful,err,data){
        if(successful == "true"){
                var sql = `
                        insert into mappingdata.user_info(User_id,Home_id,Password_CryptType,Password_CryptValue,Role,CEUserID,UC_ID_fk)
                            values(?,?,?,?,?,?,?);`;
            conUserData.beginTransaction(function(err){
                if(err) throw err;
           
                conUserData.query(sql,[ NewUserReq.UserInfo.UserID,GlobalHomeID,NewUserReq.UserInfo.UserPassword.CryptType,
                            NewUserReq.UserInfo.UserPassword.CryptVal,'User', VendorRes.UserAddRsHeader.UserAddRs.CEUserID,
                            data[0].UC_Id], function(err,result){
                            
                            if(err){
                                return conUserData.rollback(function() {
                                    callback("error",err+"; \n outer query");
                                    throw err
                                });
                            }
                                
                            else if (result.affectedRows == 1){
                                sql = ` insert into mappingdata.contact_info(UserInfo_Id,First_Name,Middle_Name,Last_Name,Person_Type,Phone_Num,Phone_Type,
                                    Email_Address,Address_Location,Address_Suite,State,City,Postal_Code,Country)
                                    values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                                var Name = NewUserReq.NewUserRq.UserProfile.PersonInfo.PersonName;
                                var PersonType = NewUserReq.NewUserRq.UserProfile.PersonInfo.NameAddrType
                                var Contact = NewUserReq.NewUserRq.UserProfile.PersonInfo.ContactInfo;
                                console.log(Contact);
                                console.log(util.inspect(NewUserReq, {showHidden: false, depth: null}));

                                conUserData.query(sql,[result.insertId,Name.FirstName,Name.MiddleName,Name.LastName,PersonType,Contact.PhoneNum.Phone,
                                    Contact.PhoneNum.PhoneType,Contact.EmailAddr,Contact.PostAddr.Addr1,Contact.PostAddr.Addr2,
                                    Contact.PostAddr.StateProv,Contact.PostAddr.City,Contact.PostAddr.PostalCode,Contact.PostAddr.Country],
                                    function(err,result){

                                        if(err){
                                            return conUserData.rollback(function() {
                                                callback("error",err+"; \n outer query");
                                                throw err
                                            });
                                        }
                                        else if(result.affectedRows == 1)
                                            conUserData.commit(function(err) {
                                                if (err) 
                                                    return conUserData.rollback(function() {
                                                        throw err;
                                                    });
                                                callback("true", null);
                                            });
                                            
                                        else
                                            return conUserData.rollback(function() {
                                                callback("false","data was not added to db; inner query invalid")
                                            });
                                           
                                    })
                            }
                            else
                                return conUserData.rollback(function() {
                                    callback("false","data was not added to db; outer query invalid")
                                });
                });
            })
        }else{
            return callback("error",err);
        } 
    }); 
};




exports.DeleteHarvestInfo = function(sessionID,HarvestAddID,RunID,callback){
    var sql = `update mappingdata.fi_info
    set Run_Id = '',HarvestAdd_Id = ''
    where Run_Id = ? and HarvestAdd_Id = ?;
    
    delete from fi_accountlogin_info where (
        select mappingdata.fi_accountlogin_info.FILoginInfo_Id from 
        (((user_creds
            inner join mappingdata.user_info on user_creds.UC_Id = mappingdata.user_info.UC_ID_fk 
                and SessionID = ?)
            inner join mappingdata.fi_info on mappingdata.fi_info.UserInfo_Id = mappingdata.user_info.UserInfo_Id)
            inner join mappingdata.fi_accountlogin_info on mappingdata.fi_accountlogin_info.FIInfo_Id = mappingdata.fi_info.FIInfo_Id);
    `
    conUserData.beginTransaction(function(err){
        if(err)
            return conUserData.rollback(function(){
                callback(false,err)
                throw err
            })
        conUserData.query(sql,[RunID,HarvestAddID,sessionID],function(err,result){
            if(err)
                return conUserData.rollback(function(){
                    callback(false,err)
                    throw err
                })
            else if(result[0].affectedRows == 1 && result[1].affectedRows >= 1)
                return conUserData.commit(function(err){
                    if(err)
                        return conUserData.rollback(function(){
                            callback(false,err)
                            throw err
                        })
                    callback(true,null)
                })
            else
                return conUserData.rollback(function(){
                    callback(false,"queries did not succeed right; rolled back") 
                })
        })
    })
}
exports.DeleteUser = function(){
    return "error";
};

exports.DeleteAccount = function(){
    return "error";
};