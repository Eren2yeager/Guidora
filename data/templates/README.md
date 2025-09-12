# CSV Templates

All CSVs must be UTF-8, comma-delimited, with the following headers. Use `|` to separate multi-valued fields inside a cell.

## colleges.csv

Headers:

name,code,type,affiliation,address,district,state,pincode,lng,lat,hostel,lab,library,internet,medium,phone,email,website,source,sourceUrl

Notes:
- `type`: Government|Private
- `medium`: e.g., EN|HI

## courses.csv

Headers:

code,name,stream,level,description,minMarks,requiredSubjects,tags,careers,govtExams,privateJobs,higherStudies,entrepreneurship,iconUrl,bannerUrl,source,sourceUrl

Notes:
- `stream`: Science|Commerce|Arts|Vocational
- `requiredSubjects`, `tags`, `careers`, etc.: `|`-separated

## programs.csv

Headers:

collegeCode,courseCode,durationYears,medium,intakeMonths,seats,cutoffLastYear,tuitionPerYear,hostelPerYear,misc,currency,source,sourceUrl

Notes:
- `medium`: EN|HI
- `intakeMonths`: month numbers separated by `|`, e.g., 6|8
