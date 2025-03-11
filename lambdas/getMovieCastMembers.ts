import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();
const moviesTable = process.env.MOVIES_TABLE_NAME;
const castsTable = process.env.CAST_TABLE_NAME;

export const handler: Handler = async (event, context) => {
  try {
    console.log("Event: ", JSON.stringify(event));
    const queryString = event?.queryStringParameters;
    const movieId = queryString ? parseInt(queryString.movieId) : undefined;
    const includeMovieDetails = queryString?.movie === 'true';

    if (!movieId) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "Missing movie Id" }),
      };
    }

    // Fetch cast members
    const queryCommand = new QueryCommand({
      TableName: castsTable,
      KeyConditionExpression: "movieId = :movieId",
      ExpressionAttributeValues: {
        ":movieId": movieId,
      },
    });
    const castResponse = await ddbDocClient.send(queryCommand);
    const castMembers = castResponse.Items;

    if (!castMembers) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "Invalid movie Id" }),
      };
    }

    // Fetch movie details if requested
    let movieDetails;
    if (includeMovieDetails) {
      const getCommand = new GetCommand({
        TableName: moviesTable,
        Key: { id: movieId },
      });
      const movieResponse = await ddbDocClient.send(getCommand);
      if (movieResponse.Item) {
        movieDetails = {
          title: movieResponse.Item.title,
          genreIds: movieResponse.Item.genre_ids,
          overview: movieResponse.Item.overview,
        };
      }
    }

    const body = {
      castMembers,
      movieDetails,
    };

    // Return Response
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    };
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error }),
    };
  }
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
