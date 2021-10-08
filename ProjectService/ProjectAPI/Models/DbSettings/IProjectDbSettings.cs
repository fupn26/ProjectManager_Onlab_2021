namespace ProjectAPI.Models.DbSettings
{
    public interface IProjectDbSettings
    {
        string ConnectionString { get; set; }
        string DatabaseName { get; set; }
    }
}
