import { serve } from "https://deno.land/std@0.163.0/http/server.ts";
import chai from "https://esm.sh/chai@4.3.6";
import opa  from "https://unpkg.com/@open-policy-agent/opa-wasm@1.8.0/dist/opa-wasm-browser.esm.js";
chai.config.truncateThreshold = 0;
export { chai, opa , serve } ;