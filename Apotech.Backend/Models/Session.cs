using System;
using System.Collections.Generic;

namespace Apotech.Backend.Models;

public partial class Session
{
    public string Id { get; set; } = null!;

    public string SessionToken { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public DateTime Expires { get; set; }

    public virtual User User { get; set; } = null!;
}
