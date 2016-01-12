/* lexical grammar */
%lex
%%
\s+                       {/* skip whitespace */}
"1"                       {return 'TRUE';}
"0"                       {return 'FALSE';}
[A-Za-z][_A-Za-z0-9]*\b   {return 'IDENTIFIER';}
"&"                       {return 'AND';}
"|"                       {return 'OR';}
"^"                       {return 'XOR';}
"!"                       {return 'NOT';}
"("                       {return '(';}
")"                       {return ')';}
<<EOF>>                   {return 'EOF';}

/lex

/* operator associations and precedence */

%left 'AND'
%left 'OR'
%left 'XOR'
%left 'NOT'

%start expressions

%% /* language grammar */

expressions
    : e EOF
        {return $1;}
    | EOF
        {return null;}
    ;

e
    : e 'AND' e
        {$$ = {node: 'binary', operator: 'AND', lhs: $1, rhs: $3};}
    | e 'OR' e
        {$$ = {node: 'binary', operator: 'OR', lhs: $1, rhs: $3};}
    | e 'XOR' e
        {$$ = {node: 'binary', operator: 'XOR', lhs: $1, rhs: $3};}
    | 'NOT' e
        {$$ = {node: 'unary', operator: 'NOT', operand: $2};}
    | '(' e ')'
        {$$ = {node: 'group', style: 1, content: $2};}
    | IDENTIFIER
        {$$ = {node: 'identifier', name: yytext};}
    | TRUE
        {$$ = {node: 'constant', value: true};}
    | FALSE
        {$$ = {node: 'constant', value: false};}
    ;