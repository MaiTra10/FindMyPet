package generic

import (
	"os"

	"github.com/lestrrat-go/jwx/v3/jwa"
	"github.com/lestrrat-go/jwx/v3/jwt"
)

func TokenClaims(token string) (Json, error) {
	tokenClaims, err := parseAndVerifyJWTClaims(token)
	if err != nil {
		return Json{}, err
	}

	return tokenClaims, nil

}

func parseAndVerifyJWTClaims(inputJWT string) (map[string]any, error) {

	jwtAlgorithm := jwa.HS256()
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))

	decodedJWTObj, err := jwt.ParseString(
		inputJWT,
		jwt.WithKey(jwtAlgorithm, jwtSecret),
		jwt.WithValidate(true),
	)
	if err != nil {
		return map[string]any{}, err
	}

	jwtMap := make(map[string]any)

	for _, key := range decodedJWTObj.Keys() {

		var value any

		err = decodedJWTObj.Get(key, &value)
		if err != nil {
			return map[string]any{}, err
		}

		jwtMap[key] = value

	}

	return jwtMap, nil

}
