<template>
  <div class="dashboard">
    <nav class="navbar navbar-dark bg-dark">
      <a class="navbar-brand" href="#">
        <img src="https://www.circleblack.com/hs-fs/hubfs/CBLogoWhite.png?width=244&name=CBLogoWhite.png" width="160" height="60">
      </a>
      <div>
        <img :src="$auth.user.picture" width="30" height="30">
        <span class="text-muted font-weight-light px-2">{{$auth.user.name}}</span>
        <button type="button" class="btn btn-outline-secondary btn-sm" @click="$auth.logout()">Logout</button>
      </div>
    </nav>

    <div class="jumbotron">
      <div class="container">
        <h1 class="display-4">Hello, {{$auth.user.name}}!</h1>
        <p class="lead">Here is your account dashboard: </p>
          <button type="button" class="btn btn-outline-secondary btn-sm" >Add account</button>
          <button type="button" class="btn btn-outline-secondary btn-sm" >Change Password</button>
          <button type="button" class="btn btn-outline-secondary btn-sm" >Delete account</button>
        <hr class="my-4">




      </div>
    </div>

    <div class = "test">

    <div class="container-fluid">
          <div class="row">
            <div class="col-lg-3 col-md-6 col-sm-6">
              <div class="card card-stats">
                <div class="card-header card-header-warning card-header-icon">
                  <div class="card-icon">
                    <i class="material-icons">Overall Balance</i>
                  </div>
                  <p class="card-category"></p>
                  <h3 class="card-title">Total: $43,997.68

                  </h3>
                </div>

              </div>
            </div>
            <div class="col-lg-3 col-md-6 col-sm-6">
              <div class="card card-stats">
                <div class="card-header card-header-success card-header-icon">
                  <div class="card-icon">
                    <i class="material-icons">Checking/</i>
                  </div>
                  <p class="card-category">Savings</p>
                  <h3 class="card-title">$34,245</h3>
                </div>
                <div class="card-footer">
                  <div class="stats">
                    <i class="material-icons">Updated:</i> Last 24 Hours
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 col-sm-6">
              <div class="card card-stats">
                <div class="card-header card-header-danger card-header-icon">
                  <div class="card-icon">
                    <i class="material-icons"></i>
                  </div>
                  <p class="card-category">Personal account</p>
                  <h3 class="card-title">$9,543</h3>
                </div>
                <div class="card-footer">
                  <div class="stats">
                    <i class="material-icons"></i> From Chase Bank
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 col-sm-6">
              <div class="card card-stats">
                <div class="card-header card-header-info card-header-icon">
                  <div class="card-icon">
                    <i class="fa fa-twitter"></i>
                  </div>
                  <p class="card-category">Investments</p>
                  <h3 class="card-title">209.68</h3>
                    <small> +1.94 (0.93%)</small>
                </div>
                <div class="card-footer">
                  <div class="stats">
                    <i class="material-icons">Updated:</i> Just Now
                  </div>
                </div>
              </div>
            </div>
          </div>



<h2>   </h2>




            <div class="col-lg-6 col-md-12">
              <div class="card">
                <div class="card-header card-header-warning">
                  <h4 class="card-title">Loans & Credit</h4>
                  <p class="card-category">Updated as of 15th July, 2019</p>
                </div>
                <div class="card-body table-responsive">
                  <table class="table table-hover">
                    <thead class="text-warning">
                      <tr><th>ID</th>
                      <th>Company</th>
                      <th>Amount</th>
                      <th>Type</th>
                    </tr></thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>First Independent Bank</td>
                        <td>$36,738</td>
                        <td>Loan</td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>First Liberty Credit Union</td>
                        <td>$23,789</td>
                        <td>Credit</td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td>First Newton National Bank</td>
                        <td>$56,142</td>
                        <td>Loan</td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>





    </div>


  </div>
</template>

<script>

</script>

<style scoped>
@import url('https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css');


.btn-primary {
  background: #468f65;
  border: 1px solid #468f65;
}
.card {
  text-decoration: none;
  color: #000;
}
</style>
