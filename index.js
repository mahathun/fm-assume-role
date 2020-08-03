const AWS  = require('aws-sdk');
var exec = require('child_process').exec;
var fs = require('fs');


var argv = require('minimist')(process.argv.slice(2));
const clipboardy = require('clipboardy');


const {role_arn, sessionname, duration, verbouse, role, accountnumber, bashcommand="", profile} = argv

const sts = new AWS.STS()

const runAssumeRole = (credentials = {})=>{
    if(!(role_arn || accountnumber || credentials.account_number || credentials.role_arn)){
        console.log('--role_arn or --accountnumber flags are required if the aws profile hasnt been specified or doesnt contain role_arn or account_number in ther.')
        return
    }
    
    var roleToAssume = {
        RoleArn: role_arn || credentials.role_arn || `arn:aws:iam::${credentials.account_number}:role/${role || "temporary_access_to_devs"}` || `arn:aws:iam::${accountnumber}:role/${role || "temporary_access_to_devs"}`,
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
    
}


// const sharedCredentials = (profile)?new AWS.SharedIniFileCredentials({profile}): null;


let credentials = null;
if(profile){
    const profiles = new Map();
    fs.readFile(process.env.HOME+'/.aws/credentials', {encoding: 'utf8'}, async (err, contents)=> {
        if(err)
            // console.log('err',err)
        let profileData = contents.split("\n\n");

        await profileData.map((profile,i)=>{
            // console.log('profile', profile)

            let profileName = profile.match(/(?<=\[).+?(?=\])/g);
            let profileData= {"test" : "test"}
            profile.replace(/\[(.*?)\]/g, '')

            let profileDataArray = profile.split('\n');

            profileDataArray.map((line, j)=>{
                
                let lineData = line.split('=');
                if(lineData.length>1){
                    console.log('lineData', lineData)

                    profileData[lineData[0].trim()] = lineData[1].trim()
                }
            
            })

            // console.log('profileName', profileName)
            // console.log('profileData', profileData)

            profiles.set(profileName[0], profileData)

            // console.log(profiles.keys())
        })
        // console.log(contents.split("\n\n"));

        credentials = profiles.get(profile)
        // console.log('credentials', credentials)

        runAssumeRole(credentials);
    });

}else{
    //dont have a profile
    runAssumeRole();

}




