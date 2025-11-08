package main

import (
	"github.com/MaiTra10/HackTheChange2025/backend/api/generic"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func main() {

	lambda.Start(handler)

}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return generic.Response(200, generic.Json{"message": "log-in Lambda is working!"})
}
