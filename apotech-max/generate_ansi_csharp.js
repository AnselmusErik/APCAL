const fs = require('fs');

const tsFile = fs.readFileSync('server/repositories/ansiRepository.ts', 'utf8');

// A better string replacement to convert TS to C#
let csCode = tsFile
    .replace(/import .*/g, '')
    .replace(/export class AnsiRepository \{/g, 'using System.Collections.Generic;\nusing System.Linq;\nusing Apotech.Backend.DTOs;\n\nnamespace Apotech.Backend.Services;\n\npublic class AnsiRepository\n{')
    .replace(/private static readonly (\w+): Record<string, SamplingPlan> = \{/g, 'private static readonly Dictionary<string, SamplingPlan> $1 = new()\n    {')
    .replace(/private static readonly (\w+): LotCodeMapping\[\] = \[/g, 'private static readonly List<LotCodeMapping> $1 = new()\n    {')
    .replace(/private static readonly (\w+): DefectClassification\[\] = \[/g, 'private static readonly List<DefectClassification> $1 = new()\n    {')
    .replace(/([A-Z]): \{ code: '([A-Z])', sampleSize: (\d+),\s*critical: \{ ac: (\d+), re: (\d+) \}, major: \{ ac: (\d+), re: (\d+) \},\s*minor: \{ ac: (\d+), re: (\d+) \} \}/g, 
        '{ "$1", new SamplingPlan { Code = "$2", SampleSize = $3, Critical = new DefectLimit { Ac = $4, Re = $5 }, Major = new DefectLimit { Ac = $6, Re = $7 }, Minor = new DefectLimit { Ac = $8, Re = $9 } } }')
    .replace(/\{ minSize: (\d+),\s*maxSize: (\d+),\s*code: '([A-Z])' \}/g, 'new LotCodeMapping { MinSize = $1, MaxSize = $2, Code = "$3" }')
    .replace(/type: '(\w+)',/g, 'Type = "$1",')
    .replace(/aql: '([\d.]+)%',/g, 'Aql = "$1%",')
    .replace(/colorCode: '([^']+)',/g, 'ColorCode = "$1",')
    .replace(/icon: '([^']+)',/g, 'Icon = "$1",')
    .replace(/examples: \[([\s\S]*?)\]/g, (match, p1) => {
        let examples = p1.split(',').map(s => s.trim().replace(/'/g, '"')).filter(s => s.length > 0).join(', ');
        return `Examples = new List<string> { ${examples} }`;
    })
    .replace(/static getCodeFromLotSize\(lotSize: number\): string \{([\s\S]*?)\}/g, 'public static string GetCodeFromLotSize(int lotSize)\n    {\n        var mapping = lotCodeMappings.FirstOrDefault(m => lotSize >= m.MinSize && lotSize <= m.MaxSize);\n        return mapping?.Code ?? "R";\n    }')
    .replace(/static getNormalPlan\(code: string\): SamplingPlan \| null \{([\s\S]*?)\}/g, 'public static SamplingPlan? GetNormalPlan(string code)\n    {\n        return normalPlans.TryGetValue(code, out var plan) ? plan : null;\n    }')
    .replace(/static getTightenedPlan\(code: string\): SamplingPlan \| null \{([\s\S]*?)\}/g, 'public static SamplingPlan? GetTightenedPlan(string code)\n    {\n        return tightenedPlans.TryGetValue(code, out var plan) ? plan : null;\n    }')
    .replace(/static getReducedPlan\(code: string\): SamplingPlan \| null \{([\s\S]*?)\}/g, 'public static SamplingPlan? GetReducedPlan(string code)\n    {\n        return reducedPlans.TryGetValue(code, out var plan) ? plan : null;\n    }')
    .replace(/static getAllLotCodeMappings\(\): LotCodeMapping\[\] \{([\s\S]*?)\}/g, 'public static List<LotCodeMapping> GetAllLotCodeMappings()\n    {\n        return lotCodeMappings;\n    }')
    .replace(/static getAllNormalPlans\(\): SamplingPlan\[\] \{([\s\S]*?)\}/g, 'public static List<SamplingPlan> GetAllNormalPlans()\n    {\n        return normalPlans.Values.ToList();\n    }')
    .replace(/static getAllTightenedPlans\(\): SamplingPlan\[\] \{([\s\S]*?)\}/g, 'public static List<SamplingPlan> GetAllTightenedPlans()\n    {\n        return tightenedPlans.Values.ToList();\n    }')
    .replace(/static getAllReducedPlans\(\): SamplingPlan\[\] \{([\s\S]*?)\}/g, 'public static List<SamplingPlan> GetAllReducedPlans()\n    {\n        return reducedPlans.Values.ToList();\n    }')
    .replace(/static getDefectClassifications\(\): DefectClassification\[\] \{([\s\S]*?)\}/g, 'public static List<DefectClassification> GetDefectClassifications()\n    {\n        return defectClassifications;\n    }')
    .replace(/static getDefectClassificationByType\(type: DefectType\): DefectClassification \| null \{([\s\S]*?)\}/g, 'public static DefectClassification? GetDefectClassificationByType(string type)\n    {\n        return defectClassifications.FirstOrDefault(d => d.Type == type);\n    }');

fs.writeFileSync('../Apotech.Backend/Services/AnsiRepository.cs', csCode);
console.log('Done!');
