# ITBio backend

### Requirements

- `gradle`
- `mongodb`

### Get up and running

```sh
$ google_clientSecret=<OAUTH2 APP SECRET GOES HERE>
$ google_redirectUri=http://localhost:8080/login/google # Optional in development
$ login_redirectUri=http://localhost:3000/user          # Optional in development
$ gradle bootRun
```