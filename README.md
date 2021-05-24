# FM ASSUME ROLE

This module makes a life a bit easier when working with AWS assume roles by adding an one line cli-interface to automatically allowing temporary credentials to work when doing deployment etc.


### To Install (globally)
`npm install -g fm-assume-role`



# Usage
> Important : this will be using your [default] AWS profile credentials to assume the roles. So it is important to set this default credentials on you aws config file and be able to assume roles from other accounts using this credentials.

## 1. Using AWS profile
You can customise the `~/.aws/credentials` files and add `role_arn` or `account_number` to any profile and use this tool to assume roles easily.

e.g

**~/.aws/credentials**
```
[myserver-prod]
aws_access_key_id = YOUR_ACCESS_KEY (this is optional for this tool)
aws_secret_access_key = YOUR_SECRET_KEY (this is optional for this tool)
role_arn = arn:aws:iam::123456789101:role/testing
account_number = 123456789101
```
then you can do,

`fm-assume-role --profile="myserver-prod" --bashcommand="sls deploy --stage=prod"`

or

`fm-assume-role --profile="myserver-prod" --role="testing" --bashcommand="sls deploy --stage=prod"`

> role_arn will have priority over account_number. if you didnt specify the `--role` , role will be defaulted to `temporary_access_to_devs`



## 2. Specifying role_arn or accountnumber in CLI

e.g.

`fm-asssume-role --role_arn="arn:aws:iam::123456789101:role/testing" --bashcommand="sls deploy --stage=prod"`

`fm-asssume-role --accountnumber="123456789101" --bashcommand="sls deploy --stage=prod"`


### Note
>If you avoid the `--bashcommand` flag and tool will only copy the new access details onto your clipboard, then you can past it on any terminal window and get access for that bash window. all subsequent aws calls will on that bash window will use the new credentials(until the token expires)


## Available Options
```
fm-assume-role
    --role_arn
    --sessionname
    --duration
    --verbose
    --role
    --accountnumber
    --bashcommand
    --profile

```


>If you come across with any issues, please open a issue in the github repo with the details of the issue.(including which operating system you are using)