# Complete node/field review inventory

Native-only inventory; detailed audit conclusions are in REPORT.md. All listed anchors were checked against the pinned ECMAScript authority.

| Node | Count | All observed fields | Native mapping |
|---|---:|---|---|
| Program | 38 | type, body, sourceType | sec-module-semantics: body: ordered ModuleItemList; sourceType=module |
| ImportDeclaration | 42 | type, specifiers, source, attributes | sec-imports: source: ModuleSpecifier; specifiers: ordered ImportClause |
| ImportSpecifier | 104 | type, imported, local | sec-imports: imported: ImportName; local: BindingIdentifier |
| ExportNamedDeclaration | 240 | type, declaration, specifiers, source, attributes | sec-exports: declaration or ordered specifiers; optional source ModuleSpecifier |
| ExportAllDeclaration | 15 | type, exported, source, attributes | sec-exports: source ModuleSpecifier; exported null means star export |
| ExportSpecifier | 2 | type, local, exported | sec-exports: local binding; exported ExportName |
| Identifier | 16373 | type, name | sec-identifiers: name is exact IdentifierName; declaration/use role follows enclosing production, not spelling alone |
| Literal | 3069 | type, value, raw | sec-primary-expression-literals: raw preserves lexical token; value preserves decoded value; regex/bigint fields select their literal production |
| VariableDeclaration | 850 | type, declarations, kind | sec-let-and-const-declarations: kind selects var/let/const; declarations preserve ordered binding/initializer pairs |
| VariableDeclarator | 1285 | type, id, init | sec-destructuring-binding-patterns: id is BindingIdentifier or BindingPattern; init null means absent initializer |
| ObjectPattern | 20 | type, properties | sec-destructuring-binding-patterns: ordered binding properties and defaults, not an object value |
| AssignmentPattern | 126 | type, left, right | sec-destructuring-binding-patterns: left binding target; right default expression evaluated only when required |
| FunctionDeclaration | 291 | type, id, expression, generator, async, params, body | sec-function-definitions: id binding; ordered params; body; async/generator flags select corresponding productions |
| FunctionExpression | 14 | type, id, expression, generator, async, params, body | sec-function-definitions: optional local id; ordered params; body; async/generator flags retained |
| ArrowFunctionExpression | 18 | type, id, expression, generator, async, params, body | sec-arrow-function-definitions: params, body, expression flag, async flag; lexical this, not ordinary FunctionExpression |
| BlockStatement | 815 | type, body | sec-block: body is ordered StatementList and lexical scope; not unordered conjunction |
| ExpressionStatement | 1384 | type, expression | sec-expression-statement: expression evaluated for effects; directive preserved if supplied |
| IfStatement | 747 | type, test, consequent, alternate | sec-if-statement: test; consequent iff ToBoolean(test); alternate otherwise, null means absent |
| ConditionalExpression | 179 | type, test, consequent, alternate | sec-conditional-operator: test; evaluate only selected consequent/alternate expression |
| ForStatement | 202 | type, init, test, update, body | sec-for-statement: init once, test before body when present, update after body/continue; break exits |
| WhileStatement | 36 | type, test, body | sec-while-statement: test before each body; abrupt completion and continue/break preserved |
| ForInStatement | 2 | type, left, right, body | sec-for-in-and-for-of-statements: left binding/target; right object; property-key enumeration; body |
| ForOfStatement | 3 | type, await, left, right, body | sec-for-in-and-for-of-statements: left binding/target; right iterable; body; await flag retained; iterator close semantics |
| ContinueStatement | 62 | type, label | sec-continue-statement: label null or exact label; abrupt continue completion |
| BreakStatement | 36 | type, label | sec-break-statement: label null or exact label; abrupt break completion |
| ReturnStatement | 511 | type, argument | sec-return-statement: argument nullable; abrupt return completion to current function |
| ThrowStatement | 51 | type, argument | sec-throw-statement: argument evaluated then abrupt throw completion |
| TryStatement | 7 | type, block, handler, finalizer | sec-try-statement: block; handler nullable; finalizer nullable; completion replacement/order retained |
| CallExpression | 725 | type, callee, arguments, optional | sec-function-calls: callee Reference then ordered arguments; optional flag; receiver preserved for property calls |
| NewExpression | 175 | type, callee, arguments | sec-new-operator: callee constructor and ordered arguments; new instance and abrupt completion |
| MemberExpression | 3818 | type, object, property, computed, optional | sec-property-accessors: object before property; computed selects bracket expression versus literal property name; optional flag retained |
| ChainExpression | 4 | type, expression | sec-optional-chains: expression carries optional-chain short circuit boundary |
| ParenthesizedExpression | 474 | type, expression | sec-grouping-operator: expression preserves grouping without introducing binding scope |
| BinaryExpression | 2854 | type, left, operator, right | sec-ecmascript-language-expressions: operator selects numeric/bitwise/relational/equality production; left and right ordered; coercion and exceptions retained |
| LogicalExpression | 404 | type, left, operator, right | sec-binary-logical-operators: operator &&/&#124;&#124;/?? selects short-circuit semantics; right conditional, not eager |
| UnaryExpression | 480 | type, operator, prefix, argument | sec-unary-operators: operator, prefix, argument; operator selects typeof/!/~/unary +/-/void/delete semantics |
| UpdateExpression | 3 | type, operator, prefix, argument | sec-update-expressions: operator and prefix distinguish value before/after update; argument is assignment target |
| AssignmentExpression | 1367 | type, operator, left, right | sec-assignment-operators: operator; left reference once; right; conversion/read-modify-write follows chosen operator |
| ArrayExpression | 12 | type, elements | sec-array-initializer: ordered elements, holes=null; spread selected by element node kind |
| ObjectExpression | 65 | type, properties | sec-object-initializer: ordered properties; evaluation order and duplicate property overwrite retained |
| Property | 451 | type, method, shorthand, computed, key, value, kind | sec-object-initializer: key,value,kind,method,shorthand,computed; enclosing ObjectPattern changes binding interpretation |
| SpreadElement | 1 | type, argument | sec-object-initializer: argument; parent production selects object spread or argument/array iterator spread |
| ClassDeclaration | 5 | type, id, superClass, body | sec-class-definitions: id,superClass,body; lexical class binding and inheritance |
| ClassBody | 5 | type, body | sec-class-definitions: ordered method definitions |
| MethodDefinition | 14 | type, static, computed, key, kind, value | sec-class-definitions: key,value,kind,computed,static; method receiver and constructor semantics |
| ThisExpression | 49 | type | sec-this-keyword: ResolveThisBinding from execution environment |
| Super | 2 | type | sec-super-keyword: super binding under method/derived-constructor environment |
| AwaitExpression | 5 | type, argument | sec-async-function-definitions: argument; suspend and resume with fulfilled/rejected completion |
| MetaProperty | 1 | type, meta, property | sec-meta-properties: meta/property exact names distinguish import.meta/new.target |
| TemplateLiteral | 1 | type, expressions, quasis | sec-template-literals: ordered quasis interleaved with ordered expressions; raw/cooked distinctions preserved |
| TemplateElement | 2 | type, value, tail | sec-template-literals: value.raw,value.cooked,tail preserved |
