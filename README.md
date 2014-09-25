# Versapp API #

## /thoughts ##
### Request ###
```
#!javascript
{
  method: "GET",
  authentication: "Basic",
  parameters:
    [
      since: "optional" // timestamp from which to load the thoughts since
    ]
  action: "Returns a JSON list of thoughts",
  contentType: "application/json"
}
```

### Example Response ###
```
#!javascript
{
  "id": 1759,
  "body": "some+thought",
  "image_url": "someurl"
  "created_timestamp": 1411095307,
  "degree": 7,
  "has_favorited": false,
  "num_favorites": 0
}
```

## /blacklist ##
### Request ###
```
#!javascript
{
  method: "POST",
  contentType: {
    request: "application/json",
    response: "application/json"
  },
  authentication: "Basic",
  parameters: [
    phones : "required" // array of phone numbers
    emails : "required" // array of emails
  ]
}
```
### Response ###
Sends 200

## /chat/create ##
### Request ###
```
#!javascript
{
  method: "GET",
  parameters: [
    type         : "required", // 121 || thought || group
    participants : "required", // array of participants
    cid          : "depends",  // required if type === 'thought' - id of thought
    name         : "depends"   // required if type === 'group' - name of group
  ],
  action: "Creates a chat, and returns the chat to the user"
}
```
### Example Response ###
```
#!javascript
{

}
## /chat/leave ##
### Request ###
```
#!javascript
{
  method: "GET",
  parameters: [

  ],
  action: ""
}
```
### Response ###
```
#!javascript
{

}
## /chat/join ##
### Request ###
```
#!javascript
{
  method: "GET",
  parameters: [

  ],
  action: ""
}
```
### Response ###
```
#!javascript
{

}
## /chat/joined ##
### Request ###
```
#!javascript
{
  method: "GET",
  parameters: [

  ],
  action: ""
}
```
### Response ###
```
#!javascript
{

}
## /chat/pending ##
### Request ###
```
#!javascript
{
  method: "GET",
  parameters: [

  ],
  action: ""
}
```
### Response ###
```
#!javascript
{

}

# Web Stuff #

## /password/forgot ##
```
#!javascript
{
  method    : "GET",
  parameters:
    [
      username : "required", // a valid username
      key      : "required" // a password key
    ],
  action: "Renders a page with a form allowing the user to reset their password"
}
```

## /password/forgot/reset ##
```
#!javascript
{
  method: "GET",
  parameters:
    [
      username : "required", // a valid username
      key      : "required", // a password key
      password : "required", // the desired new password
      confirm  : "required" // a confirmation of the desired new password
    ],
  action: Resets the users password, then redirects to a confirmation page
}
```

## /password/forgot/trigger/:email ##
```
#!javascript
{
  method: "GET",
  urlParameters:
    [
      email : "required" // the email corresponding to the account having the password reset
    ],
  action: "Creates a password reset key and emails a link to the requesting user"
}
```

## /password/forgot/confirmation ##
```
#!javascript
{
  method: "GET",
  parameters: [],
  action: "Renders a confirmation page alerting the user that their password reset was successful"
}
```
