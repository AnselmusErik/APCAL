using Apotech.Backend.DTOs;

namespace Apotech.Backend.Services;

public interface IAnsiService
{
    SamplingResult CalculateSamplingPlan(SamplingRequest request);
    EvaluationResult EvaluateDefects(EvaluationRequest request);
    object GetReferenceTables();
}

public class AnsiService : IAnsiService
{
    // ─── ANSI/ASQ Z1.4 Table I — Lot Size → Code Letter ────────────────────
    // All 7 inspection levels: S1, S2, S3, S4, GI, GII, GIII

    private static readonly List<LotSizeRow> AnsiTableI = new()
    {
        new(2,       8,       "A","A","A","A","A","A","B"),
        new(9,       15,      "A","A","A","A","A","B","C"),
        new(16,      25,      "A","A","B","B","B","C","D"),
        new(26,      50,      "A","B","B","C","C","D","E"),
        new(51,      90,      "B","B","C","C","C","E","F"),
        new(91,      150,     "B","B","C","D","D","F","G"),
        new(151,     280,     "B","C","D","E","E","G","H"),
        new(281,     500,     "B","C","D","E","F","H","J"),
        new(501,     1200,    "C","C","E","F","G","J","K"),
        new(1201,    3200,    "C","D","E","G","H","K","L"),
        new(3201,    10000,   "C","D","F","G","J","L","M"),
        new(10001,   35000,   "C","D","F","H","K","M","N"),
        new(35001,   150000,  "D","E","G","J","L","N","P"),
        new(150001,  500000,  "D","E","G","J","M","P","Q"),
        new(500001,  99999999,"D","E","H","K","N","Q","R"),
    };

    // ─── Inspection Code Labels ──────────────────────────────────────────────

    private static readonly Dictionary<string, string> InspectionCodeLabels = new()
    {
        { "S1", "Special S-1" },
        { "S2", "Special S-2" },
        { "S3", "Special S-3" },
        { "S4", "Special S-4" },
        { "GI", "General I" },
        { "GII", "General II" },
        { "GIII", "General III" },
    };

    // ─── ANSI Z1.4 Table II-A — Normal Inspection ───────────────────────────
    // AQL: Critical 0%, Major 2.5%, Minor 4.0%

    private static readonly Dictionary<string, SamplingPlan> NormalPlans = new()
    {
        { "A", new SamplingPlan { Code="A", SampleSize=2,    Critical=new(0,1), Major=new(0,1),   Minor=new(0,1)   } },
        { "B", new SamplingPlan { Code="B", SampleSize=3,    Critical=new(0,1), Major=new(0,1),   Minor=new(0,1)   } },
        { "C", new SamplingPlan { Code="C", SampleSize=5,    Critical=new(0,1), Major=new(0,1),   Minor=new(0,1)   } },
        { "D", new SamplingPlan { Code="D", SampleSize=8,    Critical=new(0,1), Major=new(0,1),   Minor=new(1,2)   } },
        { "E", new SamplingPlan { Code="E", SampleSize=13,   Critical=new(0,1), Major=new(0,1),   Minor=new(1,2)   } },
        { "F", new SamplingPlan { Code="F", SampleSize=20,   Critical=new(0,1), Major=new(1,2),   Minor=new(2,3)   } },
        { "G", new SamplingPlan { Code="G", SampleSize=32,   Critical=new(0,1), Major=new(1,2),   Minor=new(3,4)   } },
        { "H", new SamplingPlan { Code="H", SampleSize=50,   Critical=new(0,1), Major=new(2,3),   Minor=new(3,4)   } },
        { "J", new SamplingPlan { Code="J", SampleSize=80,   Critical=new(0,1), Major=new(5,6),   Minor=new(7,8)   } },
        { "K", new SamplingPlan { Code="K", SampleSize=125,  Critical=new(0,1), Major=new(7,8),   Minor=new(10,11) } },
        { "L", new SamplingPlan { Code="L", SampleSize=200,  Critical=new(0,1), Major=new(10,11), Minor=new(14,15) } },
        { "M", new SamplingPlan { Code="M", SampleSize=315,  Critical=new(0,1), Major=new(14,15), Minor=new(21,22) } },
        { "N", new SamplingPlan { Code="N", SampleSize=500,  Critical=new(0,1), Major=new(21,22), Minor=new(21,22) } },
        { "P", new SamplingPlan { Code="P", SampleSize=800,  Critical=new(0,1), Major=new(21,22), Minor=new(21,22) } },
        { "Q", new SamplingPlan { Code="Q", SampleSize=1250, Critical=new(0,1), Major=new(21,22), Minor=new(21,22) } },
        { "R", new SamplingPlan { Code="R", SampleSize=2000, Critical=new(0,1), Major=new(21,22), Minor=new(21,22) } },
    };

    // ─── ANSI Z1.4 Table II-B — Tightened Inspection ────────────────────────

    private static readonly Dictionary<string, SamplingPlan> TightenedPlans = new()
    {
        { "A", new SamplingPlan { Code="A", SampleSize=2,    Critical=new(0,1), Major=new(0,1),   Minor=new(0,1)   } },
        { "B", new SamplingPlan { Code="B", SampleSize=3,    Critical=new(0,1), Major=new(0,1),   Minor=new(0,1)   } },
        { "C", new SamplingPlan { Code="C", SampleSize=5,    Critical=new(0,1), Major=new(0,1),   Minor=new(0,1)   } },
        { "D", new SamplingPlan { Code="D", SampleSize=8,    Critical=new(0,1), Major=new(0,1),   Minor=new(0,1)   } },
        { "E", new SamplingPlan { Code="E", SampleSize=13,   Critical=new(0,1), Major=new(0,1),   Minor=new(0,1)   } },
        { "F", new SamplingPlan { Code="F", SampleSize=20,   Critical=new(0,1), Major=new(0,1),   Minor=new(1,2)   } },
        { "G", new SamplingPlan { Code="G", SampleSize=32,   Critical=new(0,1), Major=new(1,2),   Minor=new(2,3)   } },
        { "H", new SamplingPlan { Code="H", SampleSize=50,   Critical=new(0,1), Major=new(2,3),   Minor=new(3,4)   } },
        { "J", new SamplingPlan { Code="J", SampleSize=80,   Critical=new(0,1), Major=new(3,4),   Minor=new(5,6)   } },
        { "K", new SamplingPlan { Code="K", SampleSize=125,  Critical=new(0,1), Major=new(5,6),   Minor=new(8,9)   } },
        { "L", new SamplingPlan { Code="L", SampleSize=200,  Critical=new(0,1), Major=new(8,9),   Minor=new(12,13) } },
        { "M", new SamplingPlan { Code="M", SampleSize=315,  Critical=new(0,1), Major=new(12,13), Minor=new(18,19) } },
        { "N", new SamplingPlan { Code="N", SampleSize=500,  Critical=new(0,1), Major=new(18,19), Minor=new(18,19) } },
        { "P", new SamplingPlan { Code="P", SampleSize=800,  Critical=new(0,1), Major=new(18,19), Minor=new(18,19) } },
        { "Q", new SamplingPlan { Code="Q", SampleSize=1250, Critical=new(0,1), Major=new(18,19), Minor=new(18,19) } },
        { "R", new SamplingPlan { Code="R", SampleSize=2000, Critical=new(0,1), Major=new(18,19), Minor=new(18,19) } },
        { "S", new SamplingPlan { Code="S", SampleSize=3150, Critical=new(0,1), Major=new(18,19), Minor=new(18,19) } },
    };

    // ─── ANSI Z1.4 Table II-C — Reduced Inspection ──────────────────────────
    // Note: smaller sample sizes; Ac–Re gap causes revertToNormal when d is in gap

    private static readonly Dictionary<string, SamplingPlan> ReducedPlans = new()
    {
        { "A", new SamplingPlan { Code="A", SampleSize=2,   Critical=new(0,1), Major=new(0,1),  Minor=new(0,1)   } },
        { "B", new SamplingPlan { Code="B", SampleSize=2,   Critical=new(0,1), Major=new(0,1),  Minor=new(0,1)   } },
        { "C", new SamplingPlan { Code="C", SampleSize=2,   Critical=new(0,1), Major=new(0,1),  Minor=new(0,1)   } },
        { "D", new SamplingPlan { Code="D", SampleSize=3,   Critical=new(0,1), Major=new(0,1),  Minor=new(0,1)   } },
        { "E", new SamplingPlan { Code="E", SampleSize=5,   Critical=new(0,1), Major=new(0,1),  Minor=new(0,2)   } },
        { "F", new SamplingPlan { Code="F", SampleSize=8,   Critical=new(0,1), Major=new(0,2),  Minor=new(1,3)   } },
        { "G", new SamplingPlan { Code="G", SampleSize=13,  Critical=new(0,1), Major=new(1,3),  Minor=new(1,4)   } },
        { "H", new SamplingPlan { Code="H", SampleSize=20,  Critical=new(0,1), Major=new(1,4),  Minor=new(2,5)   } },
        { "J", new SamplingPlan { Code="J", SampleSize=32,  Critical=new(0,1), Major=new(2,5),  Minor=new(3,6)   } },
        { "K", new SamplingPlan { Code="K", SampleSize=50,  Critical=new(0,1), Major=new(3,6),  Minor=new(5,8)   } },
        { "L", new SamplingPlan { Code="L", SampleSize=80,  Critical=new(0,1), Major=new(5,8),  Minor=new(7,10)  } },
        { "M", new SamplingPlan { Code="M", SampleSize=125, Critical=new(0,1), Major=new(7,10), Minor=new(10,13) } },
        { "N", new SamplingPlan { Code="N", SampleSize=200, Critical=new(0,1), Major=new(10,13),Minor=new(10,13) } },
        { "P", new SamplingPlan { Code="P", SampleSize=315, Critical=new(0,1), Major=new(10,13),Minor=new(10,13) } },
        { "Q", new SamplingPlan { Code="Q", SampleSize=500, Critical=new(0,1), Major=new(10,13),Minor=new(10,13) } },
        { "R", new SamplingPlan { Code="R", SampleSize=800, Critical=new(0,1), Major=new(10,13),Minor=new(10,13) } },
    };

    // ─── Public Service Methods ──────────────────────────────────────────────

    public SamplingResult CalculateSamplingPlan(SamplingRequest request)
    {
        if (request.LotSize < 1)
            throw new ArgumentException("Lot size must be greater than 0");

        var validInspectionCodes = new[] { "S1", "S2", "S3", "S4", "GI", "GII", "GIII" };
        if (!validInspectionCodes.Contains(request.InspectionCode))
            throw new ArgumentException($"Invalid inspection code: {request.InspectionCode}");

        // Step 1 — Lookup Code Letter from Table I using inspection code column
        var letterCode = GetCodeFromLotSizeAndLevel(request.LotSize, request.InspectionCode);

        // Step 2 — Get sampling plan from the correct table (Normal / Tightened / Reduced)
        SamplingPlan plan = request.InspectionLevel switch
        {
            "normal"    => NormalPlans.GetValueOrDefault(letterCode)
                           ?? throw new KeyNotFoundException($"Normal plan not found for code {letterCode}"),
            "tightened" => TightenedPlans.GetValueOrDefault(letterCode)
                           ?? throw new KeyNotFoundException($"Tightened plan not found for code {letterCode}"),
            "reduced"   => ReducedPlans.GetValueOrDefault(letterCode)
                           ?? throw new KeyNotFoundException($"Reduced plan not found for code {letterCode}"),
            _ => throw new ArgumentException($"Invalid inspection level: {request.InspectionLevel}")
        };

        string inspectionTypeLabel = request.InspectionLevel switch
        {
            "normal"    => "Normal",
            "tightened" => "Diperketat (Tightened)",
            "reduced"   => "Diperlonggar (Reduced)",
            _           => request.InspectionLevel
        };

        string inspectionCodeLabel = InspectionCodeLabels.GetValueOrDefault(
            request.InspectionCode, request.InspectionCode);

        return new SamplingResult
        {
            ProductName         = request.ProductName,
            BatchNumber         = request.BatchNumber,
            LotSize             = request.LotSize,
            InspectionLevel     = request.InspectionLevel,
            InspectionCode      = request.InspectionCode,
            InspectionCodeLabel = inspectionCodeLabel,
            LetterCode          = letterCode,
            SamplingPlan        = plan,
            InspectionTypeLabel = inspectionTypeLabel
        };
    }

    public EvaluationResult EvaluateDefects(EvaluationRequest request)
    {
        var plan   = request.SamplingResult.SamplingPlan;
        var counts = request.DefectCounts;

        string decision;
        string reason;
        bool revertToNormal = false;

        if (counts.Critical >= 1)
        {
            decision = "reject";
            reason   = $"Ditemukan {counts.Critical} cacat kritis → melebihi batas Ac = 0 (wajib 0)";
        }
        else if (counts.Major >= plan.Major.Re)
        {
            decision = "reject";
            reason   = $"Cacat Mayor = {counts.Major} ≥ batas Re = {plan.Major.Re}";
        }
        else if (counts.Minor >= plan.Minor.Re)
        {
            decision = "reject";
            reason   = $"Cacat Minor = {counts.Minor} ≥ batas Re = {plan.Minor.Re}";
        }
        else
        {
            decision = "accept";
            bool majorInGap = counts.Major > plan.Major.Ac;
            bool minorInGap = counts.Minor > plan.Minor.Ac;

            if (request.SamplingResult.InspectionLevel == "reduced" && (majorInGap || minorInGap))
            {
                revertToNormal = true;
                var breaches = new List<string>();
                if (majorInGap) breaches.Add($"Mayor {counts.Major} > Ac {plan.Major.Ac}");
                if (minorInGap) breaches.Add($"Minor {counts.Minor} > Ac {plan.Minor.Ac}");
                reason = $"Lot diterima (semua cacat < Re), namun terdapat cacat dalam zona Ac–Re ({string.Join(", ", breaches)}). Inspeksi berikutnya WAJIB kembali ke level Normal per Z1.4 Table II-C.";
            }
            else
            {
                reason = $"Semua cacat dalam batas (Critical: {counts.Critical} = 0, Mayor: {counts.Major} ≤ Ac {plan.Major.Ac}, Minor: {counts.Minor} ≤ Ac {plan.Minor.Ac})";
            }
        }

        return new EvaluationResult
        {
            Decision       = decision,
            Reason         = reason,
            RevertToNormal = revertToNormal,
            Summary = new
            {
                request.SamplingResult.ProductName,
                request.SamplingResult.BatchNumber,
                request.SamplingResult.LotSize,
                request.SamplingResult.LetterCode,
                plan.SampleSize,
                DefectCounts = counts,
                Limits       = new { plan.Major, plan.Minor }
            }
        };
    }

    public object GetReferenceTables()
    {
        var defectClassifications = new[]
        {
            new
            {
                type = "critical",
                aql = "0%",
                colorCode = "#d9534f",
                icon = "🔴",
                examples = new[] { "Partikel asing (logam, kaca)", "Kebocoran vial/ampul", "Kontaminasi mikroba", "Label salah produk / kekuatan sediaan", "Kerusakan segel sterilitas", "Warna sediaan tidak sesuai" }
            },
            new
            {
                type = "major",
                aql = "2.5%",
                colorCode = "#f0ad4e",
                icon = "🟠",
                examples = new[] { "Kerusakan fisik ringan tapi fungsi terganggu", "Printing blur / batch number tidak jelas", "Kesalahan minor pada leaflet", "Vial retak (tanpa bocor)", "Segel aluminium longgar tapi tidak lepas" }
            },
            new
            {
                type = "minor",
                aql = "4%",
                colorCode = "#5bc0de",
                icon = "🟢",
                examples = new[] { "Goresan luar tidak mempengaruhi sterilitas", "Kemasan luar (kardus) penyok", "Perbedaan warna segel yang tidak kritis", "Bekas lem berlebih pada label", "Tulisan pada etiket sedikit buram namun masih terbaca" }
            }
        };

        var switchingRules = new
        {
            normalToTightened = new { condition = "2 dari 5 lot berturut-turut ditolak (Reject)", action = "Beralih dari Normal ke Diperketat (Tightened)" },
            tightenedToNormal = new { condition = "5 lot berturut-turut diterima (Accept) pada inspeksi diperketat", action = "Beralih dari Diperketat ke Normal" },
            normalToReduced = new { condition = "10 lot berturut-turut diterima (Accept) pada inspeksi normal", action = "Beralih dari Normal ke Diperlonggar (Reduced)" },
            reducedToNormal = new { condition = "1 lot ditolak (Reject) pada inspeksi diperlonggar", action = "Beralih dari Diperlonggar ke Normal" }
        };

        return new
        {
            lotCodeMappings = AnsiTableI.Select(r => new {
                r.MinSize,
                r.MaxSize,
                s1 = r.S1,
                s2 = r.S2,
                s3 = r.S3,
                s4 = r.S4,
                gi = r.GI,
                gii = r.GII,
                giii = r.GIII,
                code = r.GII
            }),
            samplingPlans = NormalPlans.Values,
            tightenedPlans = TightenedPlans.Values,
            reducedPlans = ReducedPlans.Values,
            defectClassifications,
            switchingRules
        };
    }

    // ─── Private Helpers ────────────────────────────────────────────────────

    private static string GetCodeFromLotSizeAndLevel(int lotSize, string inspectionCode)
    {
        var row = AnsiTableI.FirstOrDefault(r => lotSize >= r.MinSize && lotSize <= r.MaxSize);
        if (row is null) return "R"; // Clamp to max

        return inspectionCode switch
        {
            "S1"   => row.S1,
            "S2"   => row.S2,
            "S3"   => row.S3,
            "S4"   => row.S4,
            "GI"   => row.GI,
            "GII"  => row.GII,
            "GIII" => row.GIII,
            _      => row.GII // Default to General II
        };
    }

    // ─── Private Data Record ─────────────────────────────────────────────────

    private record LotSizeRow(
        int    MinSize, int MaxSize,
        string S1, string S2, string S3, string S4,
        string GI, string GII, string GIII
    );
}
