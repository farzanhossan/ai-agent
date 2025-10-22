import { ENV } from "@src/env";

export const CREATE_NOTIFIER_QUEUE = `${ENV.env}_` + 'CREATE_NOTIFIER_QUEUE';
export const CREATE_NOTIFIER_QUEUE_PROCESSOR = `${ENV.env}_` + 'CREATE_NOTIFIER_QUEUE_PROCESSOR';