const AWS  = require('aws-sdk');
var exec = require('child_process').exec;
var argv = require('minimist')(process.argv.slice(2));
const clipboardy = require('clipboardy');



const {arnrole, sessionname, duration, verbouse} = argv



const S3 = new AWS.S3();
const sts = new AWS.STS()


// const S3BUCKETS = S3.listBuckets((err, data)=>{
//     if(err){
//         console.log('error', err)
//         return err;
//     }

//     console.log('data', data)
    
    
// })

var roleToAssume = {
    RoleArn: arnrole,//'arn:aws:iam::429308279912:role/temporary_access_to_devs',
    RoleSessionName: sessionname || "Temp Access"//'dan@QA',
  };



const data1 = sts.assumeRole(roleToAssume, (err,data)=>{
    if(err)
        return err
    console.log("Just paste and press enter");
    if(verbouse){
        console.log("if any issues manually COPY this and run to update the environement variables")
        console.log(`export AWS_ACCESS_KEY_ID=${data.Credentials.AccessKeyId}; export AWS_SECRET_ACCESS_KEY=${data.Credentials.SecretAccessKey}; export AWS_SESSION_TOKEN=${data.Credentials.SessionToken}`)
    }
        
    clipboardy.writeSync(`export AWS_ACCESS_KEY_ID=${data.Credentials.AccessKeyId}; export AWS_SECRET_ACCESS_KEY=${data.Credentials.SecretAccessKey}; export AWS_SESSION_TOKEN=${data.Credentials.SessionToken}`);


    // exec(`echo export AWS_ACCESS_KEY_ID=${data.Credentials.AccessKeyId}; echo export AWS_SECRET_ACCESS_KEY=${data.Credentials.SecretAccessKey}; echo export AWS_SESSION_TOKEN=${data.Credentials.SessionToken}`, (err, stdout, stderr) => {
    //     if (err) {
    //       //some err occurred
    //       console.error(err)
    //     } else {
    //      // the *entire* stdout and stderr (buffered)
    //      console.log(`stdout: ${stdout}`);

    //     }
    //   });
})
