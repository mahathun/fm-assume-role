const AWS  = require('aws-sdk');
var exec = require('child_process').exec;

var argv = require('minimist')(process.argv.slice(2));
const clipboardy = require('clipboardy');


const {arnrole, sessionname, duration, verbouse, role, accountnumber, bashcommand=""} = argv

const sts = new AWS.STS()

if(!(arnrole || accountnumber)){
    console.log('--arnrole or --accountnumber flags are required')
    return
}

var roleToAssume = {
    RoleArn: arnrole || `arn:aws:iam::${accountnumber}:role/${role || "temporary_access_to_devs"}`,
    RoleSessionName: sessionname || "Temp Access"//'dan@QA',
  };



const data1 = sts.assumeRole(roleToAssume, async (err,data)=>{
    if(err)
        return err
    

    if(bashcommand){
        process.env['AWS_ACCESS_KEY_ID'] = `${data.Credentials.AccessKeyId}`
        process.env['AWS_SECRET_ACCESS_KEY'] = `${data.Credentials.SecretAccessKey}`
        process.env['AWS_SESSION_TOKEN'] = `${data.Credentials.SessionToken}`
    
    
        await exec(`${bashcommand}`,(err,output, outputerr)=>{
            if (err) {
                console.log(`error: ${err.message}`);
                return;
            }
            if (outputerr) {
                console.log(`stderr: ${outputerr}`);
                return;
            }
            console.log(`output: ${output}`);
    
        }) 
        console.log("Access credentials have also been copied to your clipboard.");

        if(verbouse){
            console.log("if any issues manually COPY this and run to update the environement variables")
            console.log(`export AWS_ACCESS_KEY_ID=${data.Credentials.AccessKeyId}; export AWS_SECRET_ACCESS_KEY=${data.Credentials.SecretAccessKey}; export AWS_SESSION_TOKEN=${data.Credentials.SessionToken}`)
        }
        
        clipboardy.writeSync(`export AWS_ACCESS_KEY_ID=${data.Credentials.AccessKeyId}; export AWS_SECRET_ACCESS_KEY=${data.Credentials.SecretAccessKey}; export AWS_SESSION_TOKEN=${data.Credentials.SessionToken}`);

    }else{
        console.log("Just paste and press enter");
        if(verbouse){
            console.log("if any issues manually COPY this and run to update the environement variables")
            console.log(`export AWS_ACCESS_KEY_ID=${data.Credentials.AccessKeyId}; export AWS_SECRET_ACCESS_KEY=${data.Credentials.SecretAccessKey}; export AWS_SESSION_TOKEN=${data.Credentials.SessionToken}`)
        }
        
        clipboardy.writeSync(`export AWS_ACCESS_KEY_ID=${data.Credentials.AccessKeyId}; export AWS_SECRET_ACCESS_KEY=${data.Credentials.SecretAccessKey}; export AWS_SESSION_TOKEN=${data.Credentials.SessionToken}`);
    }
})
