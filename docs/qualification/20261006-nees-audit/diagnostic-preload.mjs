// Audit-only process-wide V8 switches. No solver warmup or runtime rewriting.
import '../../../isomax/runtime/tools/benchmark-v8-startup-preload.mjs';
const auditFlag=/^(?:--trace-gc|--trace-file-names|--print-opt-code|--print-opt-code-filter=negamax|--redirect-code-traces)$/;
for(let i=process.execArgv.length-1;i>=0;i--)if(auditFlag.test(process.execArgv[i]))process.execArgv.splice(i,1);
