namespace ProjectAPI.Models.DbSettings
{
    public class ProjectDbSettings : IProjectDbSettings
    {
        public string ConnectionString { get; set; }
        public string DatabaseName { get; set; }
    }
}
