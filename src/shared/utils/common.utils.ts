import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import * as path from 'path';

export const identifyIdentifier = (identifier: string, obj: any) => {
  const phoneNumberRegex = /^[\d\s().-]+$/;
  const usernameRegex = /^[a-z0-9]{3,16}$/; // Only lowercase letters and numbers (no underscores)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const userCodeRegex = /^[a-zA-Z0-9@.+_-]+$/;

  if (!obj.phoneNumber && phoneNumberRegex.test(identifier)) {
    obj.phoneNumber = identifier;
  } else if (!obj.username && usernameRegex.test(identifier)) {
    obj.username = identifier;
  } else if (!obj.email && emailRegex.test(identifier)) {
    obj.email = identifier;
  } else {
    throw new BadRequestException('Invalid Identifier!!');
  }
  return obj;
};

export const identifyLoginIdentifier = (identifier: string) => {
  const phoneNumberRegex = /^[\d\s().-]+$/;
  const usernameRegex = /^[a-z0-9]{3,16}$/; // Only lowercase letters and numbers (no underscores)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const userCodeRegex = /^[a-zA-Z0-9@.+_-]+$/;

  if (phoneNumberRegex.test(identifier)) {
    return { key: 'phoneNumber', value: identifier };
  } else if (usernameRegex.test(identifier)) {
    return { key: 'username', value: identifier };
  } else if (emailRegex.test(identifier)) {
    return { key: 'email', value: identifier };
  } else if (userCodeRegex.test(identifier)) {
    return { key: 'code', value: identifier };
  } else {
    throw new BadRequestException('Invalid Identifier!!');
  }
};

export const getPaginationData = (payload: any) => {
  let { page, limit } = payload;
  page = Number(page || 1);
  limit = Number(limit || 10);
  const skip = (page - 1) * limit;
  return { skip, limit, page };
};

export const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const isNumberArrayEqual = (array1: number[], array2: number[]): boolean => {
  array1 = array1.sort((x: number, y: number) => x - y);
  array2 = array2.sort((x: number, y: number) => x - y);

  return (
    Array.isArray(array1) &&
    Array.isArray(array2) &&
    array1.length === array2.length &&
    array1.every((val, index) => val === array2[index])
  );
};

export const unifyCombinationArray = (
  array: { combinations: number[]; goTo: number; id?: number }[],
): { combinations: number[]; goTo: number; id?: number }[] => {
  const uniqueArr = array.filter((item, index, self) => {
    const combination = item.combinations.slice().sort().join(',');
    return (
      index === self.findIndex((obj) => obj.combinations.slice().sort().join(',') === combination)
    );
  });
  return uniqueArr;
};

export function isArrayHasSameObject<T>(arr: T[], propertyKey: keyof T): boolean {
  const unique = [...new Set(arr.map((a) => a[propertyKey]))];
  if (unique.length === arr.length) {
    return false;
  }

  return true;
}
export const gen6digitOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const generateFilename = (file) => {
  return `${Date.now()}${path.extname(file.originalname)}`;
};

export const storageImageOptions = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    callback(null, generateFilename(file));
  },
});

export const storageFileOptions = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    callback(null, generateFilename(file));
  },
});

export const storageExcelOptions = diskStorage({
  destination: './uploads/temp',
  filename: (req, file, callback) => {
    callback(null, generateFilename(file));
  },
  //   fileFilter: function (req, file, cb) {
  //     console.log('file ==>', file);

  //     if (!file.originalname.match(/\.(xlsx|xls)$/)) {
  //       return cb(new Error('Only Excel files are allowed!'));
  //     }
  //     cb(null, true);
  //   },
});

export const pick = (obj: object, keys: string[]) => {
  return keys.reduce<{ [key: string]: unknown }>((finalObj, key) => {
    const value = obj[key as keyof typeof obj];
    if (value !== undefined && value !== null && value !== '') {
      finalObj[key] = value;
    }
    return finalObj;
  }, {});
};

export function generateCode(prefix = '') {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const msec = String(now.getMilliseconds()).padStart(3, '0');
  return `${prefix}${year}${month}${date}${msec}`;
}

export function getPastDate(date, daysAgo: number): Date {
  const startDate = date ? new Date(date) : new Date();
  startDate.setDate(date.getDate() - daysAgo);
  return date;
}
