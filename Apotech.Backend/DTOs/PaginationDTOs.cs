namespace Apotech.Backend.DTOs;

public class PaginationRequest
{
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 10;
}

public class PaginationResponse<T>
{
    public IEnumerable<T> Data { get; set; } = new List<T>();
    public int Total { get; set; }
    public int Page { get; set; }
    public int TotalPages { get; set; }
}
