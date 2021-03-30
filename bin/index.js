#!/usr/bin/env node
const AWS  = require('aws-sdk');
const exec = require('child_process').exec;
const fs = require('fs');
const pjson = require('./../package.json');
const argv = require('minimist')(process.argv.slice(2), {string: "accountnumber"});
const clipboardy = require('clipboardy');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json')


updateNotifier({pkg}).notify();

const {role_arn, sessionname, duration, verbouse, role, accountnumber, bashcommand="", profile, v, dont_use_default_profile, h} = argv

const runAssumeRole = async(credentials = {}, defaultProfileCredentials = null)=>{
    const sts = (defaultProfileCredentials)?new AWS.STS({credentials: {
        accessKeyId: defaultProfileCredentials.aws_access_key_id,
        secretAccessKey : defaultProfileCredentials.aws_secret_access_key,
        region: defaultProfileCredentials.region,
    }}): new AWS.STS()

    if(!(role_arn || accountnumber || credentials.account_number || credentials.role_arn)){
        console.log('--role_arn or --accountnumber flags are required if the aws profile hasnt been specified or doesnt contain role_arn or account_number in ther.')
        return
    }

    
    var roleToAssume = {
        RoleArn: role_arn || credentials.role_arn || `arn:aws:iam::${credentials.account_number || `${accountnumber}`}:role/${role || "temporary_access_to_devs"}` || `arn:aws:iam::${accountnumber}:role/${role || "temporary_access_to_devs"}`,
        RoleSessionName: sessionname || "TempAccess"//'mahathun@QA',
      };
    
    
    const data1 = await sts.assumeRole(roleToAssume, async (err,data)=>{
        if(err){
            console.log('error', err)
            return err
        }
    
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
            }else{
                clipboardy.writeSync(`export AWS_ACCESS_KEY_ID=${data.Credentials.AccessKeyId}; export AWS_SECRET_ACCESS_KEY=${data.Credentials.SecretAccessKey}; export AWS_SESSION_TOKEN=${data.Credentials.SessionToken}`);
            }
        }else{
            console.log("Just paste and press enter");
            if(verbouse){
                console.log("if any issues manually COPY this and run to update the environement variables")
                console.log(`export AWS_ACCESS_KEY_ID=${data.Credentials.AccessKeyId}; export AWS_SECRET_ACCESS_KEY=${data.Credentials.SecretAccessKey}; export AWS_SESSION_TOKEN=${data.Credentials.SessionToken}`)
            }else{
                clipboardy.writeSync(`export AWS_ACCESS_KEY_ID=${data.Credentials.AccessKeyId}; export AWS_SECRET_ACCESS_KEY=${data.Credentials.SecretAccessKey}; export AWS_SESSION_TOKEN=${data.Credentials.SessionToken}`);
            }
        }
    })
    
}


if(h){
    console.log(`${pjson.name}\nVersion: ${pjson.version}`)
    console.log(`\t--role_arn\n\t\trole_arn which going to be assumed`)
    console.log(`\t--sessionname\n\t\tremote session name`)
    console.log(`\t--duration\n\t\tduration of the temporary tokens`)
    console.log(`\t--verbouse\n\t\tprintout the temporary credentials to the terminal`)
    console.log(`\t--role\n\t\trole name which will be assuming, default is temporary_access_to_devs`)
    console.log(`\t--accountnumber\n\t\taccount number of the account having the role to be assumed`)
    console.log(`\t--bashcommand\n\t\tbash command needed to run`)
    console.log(`\t--profile\n\t\taws config profile name`)
    console.log(`\t--dont_use_default_profile\n\t\tuse to use the aws credentials of the current terminal instead of default profile`)
    console.log(`\t--v\n\t\tprint out the fm-assume-role version`)
    console.log(`\t--h\n\t\thelp`)
    
    return;
}
if(v){
    console.log(`${pjson.name}\nVersion: ${pjson.version}`)
    return
}

let credentials = null;
if(profile){
    const profiles = new Map();
    
    const operatingSystem = process.platform;
    const seperator = (operatingSystem=="win32")? '\r\n': '\n';

    fs.readFile(process.env.HOME+'/.aws/credentials', {encoding: 'utf8'}, async (err, contents)=> {
        if(err)
            console.log('err',err)

        let profileData = contents.split(`${seperator}${seperator}`);

        await profileData.map((profile,i)=>{

            let profileName = profile.match(/(?<=\[).+?(?=\])/g);
            let profileData= {}
            profile.replace(/\[(.*?)\]/g, '')

            let profileDataArray = profile.split(`${seperator}`);

            profileDataArray.map((line, j)=>{
                
                let lineData = line.split('=');
                if(lineData.length>1){
                    profileData[lineData[0].trim()] = lineData[1].trim()
                }
            
            })

            if(profileName){
                profiles.set(profileName[0], profileData)
            }

        })


        credentials = profiles.get(profile)
        let defaultProfileCredentials = profiles.get('default')

        console.log('dont_use_default_profile', dont_use_default_profile)

        return (dont_use_default_profile)?runAssumeRole(credentials): runAssumeRole(credentials, defaultProfileCredentials);
    });

}else{
    //dont have a profile
    return runAssumeRole();

}




