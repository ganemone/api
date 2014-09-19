# Versapp API #

## Endpoints ##

### /password/forgot ###
Method: GET

Parameters:

* username - | required | a valid username
* key -           | required | a password key

Action: Renders a page with a form allowing the user to reset their password

### /password/forgot/reset ###
Method: GET

Parameters:

* username | required | a valid username
* key            | required | a password key
* password  | required | the desired new password
* confirm     | required | a confirmation of the desired new password

Action: Resets the users password, then redirects to a confirmation page

### /password/forgot/trigger/:email ###
Method: GET

URL Parameters:

* email | required | the email corresponding to the account having the password reset

Action: Creates a password reset key and emails a link to the requesting user

### /password/forgot/confirmation ###
Method: GET

Parameters: NONE


Action: Renders a confirmation page alerting the user that their password reset was successful

### /thoughts ###
Method: GET

Parameters:

* since | optional | timestamp from which to load the thoughts since
Authentication: Basic

Action: Returns a JSON list of thoughts
Response Content Type: application/json
Example Response: 

```
#!json
{ 
  "id": 1759,
  "body": "some+thought",
  "image_url": "someurl"
  "created_timestamp": 1411095307,
  "degree": "global",
  "has_favorited": "false",
  "num_favorites": 0,
  "score": 1411095307 
}
```
NOTE: The has favorited parameter is surrounded by quotes. You will need to booleanize this on the client.

### /blacklist ###
Method: POST
Request Content Type: application/json
Response Content Type: application/json
Authentication: Basic
Parameters:

* phones | required | array of phone numbers
* emails | required | array of emails

## TODO ##

* /chat/create
* /chat/leave

## Maybe TODO ##

* /chat/block
* /chat/unblock
* /hack/secret
* /crash/whisper