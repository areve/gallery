import { handler } from "./../../api/api";
import * as functionsFramework from "@google-cloud/functions-framework";

functionsFramework.http("helloWorld", handler);
