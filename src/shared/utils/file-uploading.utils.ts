import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const newName = uuidv4();
  callback(null, `${newName}`);
};
