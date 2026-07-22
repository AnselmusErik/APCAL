using Microsoft.EntityFrameworkCore;

namespace Apotech.Backend.Models;

public partial class AppDbContext
{
    partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ProblemVerification>(entity =>
        {
            entity.Property(e => e.GeneralLevel).HasColumnName("generalLevel");
            entity.Property(e => e.UnitType).HasColumnName("unitType");
        });

        modelBuilder.Entity<ProblemFinding>(entity =>
        {
            entity.Property(e => e.ContainerType).HasColumnName("containerType");
        });
    }
}
