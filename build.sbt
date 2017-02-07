name := "LSBEngine"

version := "0.0"

scalaVersion := "2.12.1"

ivyScala := ivyScala.value map {
  _.copy(overrideScalaVersion = true)
}

scalacOptions ++= Seq("-unchecked", "-deprecation", "-encoding", "utf8", "-feature")

libraryDependencies ++= {
  val akkaV = "2.4.16"
  val akkaHttpV = "10.0.3"
  val reactiveMongoV = "0.12.1"
  val scalaTestV = "3.0.1"
  val nscalaTimeV = "2.14.0"
  val slf4jV = "1.7.21"
  val logbackV = "1.1.7"

  Seq(
    "org.reactivemongo" %% "reactivemongo" % reactiveMongoV,
    "com.typesafe.akka" %% "akka-http-core" % akkaHttpV,
    "com.typesafe.akka" %% "akka-http" % akkaHttpV,
    "com.typesafe.akka" %% "akka-http-testkit" % akkaHttpV,
    "com.typesafe.akka" %% "akka-http-spray-json" % akkaHttpV,
    "com.typesafe.akka" %% "akka-http-jackson" % akkaHttpV,
    "com.typesafe.akka" %% "akka-http-xml" % akkaHttpV,
    "com.typesafe.akka" %% "akka-actor" % akkaV,
    "com.typesafe.akka" %% "akka-testkit" % akkaV % "test",
    "com.typesafe.akka" %% "akka-slf4j" % akkaV,
    "org.scalatest" %% "scalatest" % scalaTestV % "test",
    "com.github.nscala-time" %% "nscala-time" % nscalaTimeV,
    "org.slf4j" % "slf4j-api" % slf4jV,
    "org.scala-lang" % "scala-reflect" % scalaVersion.value,
    "ch.qos.logback" % "logback-core" % logbackV,
    "ch.qos.logback" % "logback-classic" % logbackV,
    "net.logstash.logback" % "logstash-logback-encoder" % "4.7"
  )
}

lazy val `lsbengine` = project.in(file(".")).
  enablePlugins(BuildInfoPlugin, SbtTwirl).
  settings(
    buildInfoKeys := Seq[BuildInfoKey](name, version, scalaVersion, sbtVersion),
    buildInfoPackage := "me.lsbengine.server"
  )


buildInfoOptions += BuildInfoOption.BuildTime
buildInfoOptions += BuildInfoOption.ToJson

buildInfoKeys ++= Seq[BuildInfoKey](
  BuildInfoKey.action("commitHash") {
    Process("git rev-parse HEAD").lines.head
  }
)

lazy val sass = taskKey[Unit]("Compiles the css")

sass := {
  println("Compiling css...")
  "./build-sass.sh" !
}

resolvers ++= Seq("spray" at "http://repo.spray.io/")

resolvers ++= Seq("snapshots", "releases").map(Resolver.sonatypeRepo)

resolvers ++= Seq("Sonatype Snapshots" at "https://oss.sonatype.org/content/repositories/snapshots/")

resolvers ++= Seq("Typesafe repository releases" at "http://repo.typesafe.com/typesafe/releases/")

resolvers ++= Seq("slf4j on Maven" at "https://mvnrepository.com/artifact/org.slf4j/slf4j-api")
resolvers ++= Seq("logback-core on Maven" at "https://mvnrepository.com/artifact/ch.qos.logback/logback-core")
resolvers ++= Seq("logback-classic on Maven" at "https://mvnrepository.com/artifact/ch.qos.logback/logback-classic")
resolvers ++= Seq("Logback logstash interface" at "https://mvnrepository.com/artifact/net.logstash.logback/logstash-logback-encoder")

assemblyJarName in assembly := "lsbengine.jar"

test in assembly := {}

parallelExecution in Test := false
Revolver.settings

compile in Compile := ((compile in Compile) dependsOn sass).value
mainClass in(Compile, run) := Some("me.lsbengine.server.Blog")