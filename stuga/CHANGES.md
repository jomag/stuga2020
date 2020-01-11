I've tried to minimize the changes to the original file (stuga.bas) as downloaded
from the autho, Kimmo Eriksson's homepage (www.kimmoeriksson.se). All changes
are documented here:

## Character Encoding

The original seem to be encoded in ISO-646-SE. This means that swedish
characters are displayed as "{", "}", "\", "]", etc when opened as UTF-8.
This can easily be converted using iconv:

```sh
iconv -f iso-646-se -t utf-8 stuga.bas
```

But the problem is that some of these characters are used in the BASIC
syntax, for example to separate statements on one line

```basic
10 PRINT "Hello" \ PRINT "World"
```

Just translating that using iconv would result in this string, which
is not legal BASIC:

```basic
10 PRINT "Hello" Ö PRINT "World"
```

I found no other solution than to semi-manually replace all swedish
characters in strings and comments. The file was then saved as UTF-8.

## Change end of line

Original had Window style CR+LF line ending. This has been changed
to Unix style (LF only).

## Fix invalid line breaks

There was a number of invalid, and probably unintentional, line
breaks such as these that have been fixed:

```basic
00724 PRINT "                      I------I"
00725 PRINT "----------------------I *  *
I----------------------------"
00726 PRINT "                      I      I"
00727 PRINT "                       --II--"
00728 PRINT "                         II"
00729 PRINT "                         --" \ RETURN
00730 REM******************OLLES SUBRUTIN****************************
00731 PRINT "Du kommer in i ett rum där det står en massa djur! På
en"
00732 PRINT "skylt i luften står det"
```

## Misc fixes

### Line 80336 and 90982

Original:

```basic
80336 IF END#1 THEN 80340'$$$$$'&&&&&
```

The interpreter does not yet understand END#1 and throws an "empty expression"
error. The line is not critical so it's been disabled.

Same thing for line 90982.

### Line 99402, 99405

Original:

```basic
99402 OPEN "STUGA.TXT[11,155]$80" AS FILE :1'%%%%%
99405 SET :1,LOF(:1)+1'%%%%%
```

These are not yet understood by the interpreter. Disabled.

### Line 99415, 99420

Original:

```basic
99415 WRITE :1,A$'%%%%%
99420 WRITE :1,W$(J) FOR J=1 TO I'%%%%%
```

The `WRITE` statement is not yet implemented. Disabled.

### Line 90064

Original:

```basic
90064 X=CRT(1)
```

The `CRT` statement is not yet implemented. Disabled.
