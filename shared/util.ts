import { marshall } from "@aws-sdk/util-dynamodb";
import { Movie, MovieCast } from "./types";

type Entity = Movie | MovieCast;

export const generateItem = (entity: Entity) => {
<<<<<<< HEAD
  return { PutRequest: { Item: marshall(entity) } };
};

export const generateBatch = (data: Entity[]) => {
  return data.map((e) => generateItem(e));
=======
  return {
    PutRequest: {
      Item: marshall(entity),
    },
  };
};

export const generateBatch = (data: Entity[]) => {
  return data.map((e) => {
    return generateItem(e);
  });
>>>>>>> 06f30869fa230fe728ac4451d1ecb7f46afbad50
};
