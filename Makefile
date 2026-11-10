.PHONY: verify

verify:
	npm run typecheck
	npm test
