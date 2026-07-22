using System;
using System.Collections.Generic;

namespace Apotech.Backend.Models;

public partial class User
{
    public string Id { get; set; } = null!;

    public string? Name { get; set; }

    public string Email { get; set; } = null!;

    public DateTime? EmailVerified { get; set; }

    public string? Image { get; set; }

    public string? Password { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<Account> Accounts { get; set; } = new List<Account>();

    public virtual ICollection<ProblemVerification> ProblemVerifications { get; set; } = new List<ProblemVerification>();

    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
