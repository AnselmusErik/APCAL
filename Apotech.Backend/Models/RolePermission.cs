using System;
using System.Collections.Generic;

namespace Apotech.Backend.Models;

public partial class RolePermission
{
    public string Id { get; set; } = null!;

    public string RoleId { get; set; } = null!;

    public string PermissionId { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual Permission Permission { get; set; } = null!;

    public virtual Role Role { get; set; } = null!;
}
