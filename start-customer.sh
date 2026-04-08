#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"
cd "/Users/zzzztong/Desktop/app dev/fixnest/customer-app"
exec npm run dev -- --port 3000 --host
