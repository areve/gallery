import { handler } from "./handler";
import * as functionsFramework from "@google-cloud/functions-framework";

functionsFramework.http("gallery-api", handler);
