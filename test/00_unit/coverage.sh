#/bin/bash

rm -rf ../../app-cov
jscoverage ../../app ../../app-cov
TEST_COV=1 mocha ./ --recursive --reporter html-cov > coverage.html